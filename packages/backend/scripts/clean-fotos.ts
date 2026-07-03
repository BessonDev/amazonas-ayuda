import { PrismaClient } from '@prisma/client'
import * as Minio from 'minio'

const prisma = new PrismaClient()

const minio = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

const bucket = process.env.MINIO_BUCKET || 'donaciones-amazonas'

async function main() {
  const archivos = await prisma.archivo.findMany({
    where: { entidadTipo: 'Recepcion', mimeType: 'image/jpeg' },
  })

  console.log(`Encontrados ${archivos.length} con mimeType incorrecto`)

  for (const a of archivos) {
    try {
      await minio.removeObject(bucket, a.url)
      console.log(`  🗑️ MinIO: ${a.url}`)
    } catch (e) {
      console.log(`  ⚠️ MinIO error: ${a.url}`)
    }
    await prisma.archivo.delete({ where: { id: a.id } })
    console.log(`  🗑️ DB: ${a.nombre}`)
  }

  const remaining = await prisma.archivo.count({ where: { entidadTipo: 'Recepcion' } })
  console.log(`\n📸 ${remaining} fotos de recepción restantes`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
