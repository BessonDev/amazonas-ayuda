import { PrismaClient } from '@prisma/client'
import * as Minio from 'minio'
import * as zlib from 'zlib'
import { extname } from 'path'

const prisma = new PrismaClient()

const minio = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

const bucket = process.env.MINIO_BUCKET || 'donaciones-amazonas'

function generateSolidPng(width: number, height: number, r: number, g: number, b: number): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const rawData = Buffer.alloc(height * (1 + width * 3))
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 3)] = 0
    for (let x = 0; x < width; x++) {
      const offset = y * (1 + width * 3) + 1 + x * 3
      rawData[offset] = r
      rawData[offset + 1] = g
      rawData[offset + 2] = b
    }
  }

  const compressed = zlib.deflateSync(rawData)

  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdr]))
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]))

  const ihdrChunk = Buffer.concat([
    u32(13), Buffer.from('IHDR'), ihdr, u32(ihdrCrc),
  ])
  const idatChunk = Buffer.concat([
    u32(compressed.length), Buffer.from('IDAT'), compressed, u32(idatCrc),
  ])
  const iendChunk = Buffer.concat([
    u32(0), Buffer.from('IEND'), u32(crc32(Buffer.from('IEND'))),
  ])

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

function u32(v: number): Buffer {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(v, 0)
  return b
}

function crc32(data: Buffer): number {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

async function ensureBucket() {
  const exists = await minio.bucketExists(bucket)
  if (!exists) await minio.makeBucket(bucket)
}

const COLORS = [
  { name: 'verde', r: 76, g: 175, b: 80 },
  { name: 'azul', r: 33, g: 150, b: 243 },
  { name: 'naranja', r: 255, g: 152, b: 0 },
  { name: 'rojo', r: 244, g: 67, b: 54 },
  { name: 'morado', r: 156, g: 39, b: 176 },
]

async function main() {
  await ensureBucket()

  const recepciones = await prisma.recepcion.findMany({
    include: { viaje: { select: { codigo: true } } },
    orderBy: { createdAt: 'desc' },
  })

  if (recepciones.length === 0) {
    console.log('❌ No hay recepciones. Primero marca un viaje como recibido.')
    await prisma.$disconnect()
    return
  }

  console.log(`📦 ${recepciones.length} recepciones encontradas`)

  for (let i = 0; i < 5; i++) {
    const recepcion = recepciones[i % recepciones.length]
    const color = COLORS[i]
    const ext = '.png'

    const timestamp = Date.now() + i
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `${timestamp}-${random}${ext}`
    const pngBuffer = generateSolidPng(640, 480, color.r, color.g, color.b)

    await minio.putObject(bucket, filename, pngBuffer, pngBuffer.length, {
      'Content-Type': 'image/png',
    })

    await prisma.archivo.create({
      data: {
        nombre: `Recepcion-${recepcion.id}-${timestamp}${ext}`,
        url: filename,
        mimeType: 'image/png',
        tamanio: pngBuffer.length,
        entidadTipo: 'Recepcion',
        entidadId: recepcion.id,
        viajeId: recepcion.viajeId,
      },
    })

    console.log(`  ✅ Foto ${i + 1}/5 — ${color.name} → Recepción #${recepcion.id} (${recepcion.viaje.codigo})`)
  }

  console.log('\n🎉 5 fotos de muestra creadas. Recarga el portal público para ver el carrusel.')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
