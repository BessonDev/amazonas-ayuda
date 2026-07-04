import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateViajeDto } from './dto/create-viaje.dto'
import { UpdateViajeDto } from './dto/update-viaje.dto'
import { EstadoViaje } from '@prisma/client'

@Injectable()
export class ViajesService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    campania: true,
    origen: { include: { tipo: true } },
    destino: { include: { tipo: true } },
    responsable: true,
    detalles: {
      include: {
        lote: {
          include: {
            producto: { include: { categoria: true } },
            donante: true,
            ubicacion: true,
          },
        },
      },
    },
    recepciones: true,
  }

  private readonly TIPOS_ORIGEN_PERMITIDOS = ['CENTRO_ACOPIO']

  private generarCodigo(): string {
    const now = new Date()
    const yymmdd = `${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `VIAJE-${yymmdd}-${rand}`
  }

  private async validarOrigen(origenId: number) {
    const origen = await this.prisma.ubicacion.findUnique({
      where: { id: origenId },
      include: { tipo: true },
    })
    if (!origen || !this.TIPOS_ORIGEN_PERMITIDOS.includes(origen.tipo.nombre)) {
      throw new BadRequestException('El origen del viaje debe ser un Centro de Acopio')
    }
    return origen
  }

  async listar(destinoId?: number) {
    const where: any = {}
    if (destinoId) where.destinoId = destinoId
    return this.prisma.viaje.findMany({
      where,
      include: this.include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async obtener(id: number) {
    const viaje = await this.prisma.viaje.findUnique({
      where: { id },
      include: this.include,
    })
    if (!viaje) throw new NotFoundException('Viaje no encontrado')
    return viaje
  }

  async crear(dto: CreateViajeDto) {
    await this.validarOrigen(dto.origenId)
    const codigo = this.generarCodigo()

    return this.prisma.viaje.create({
      data: {
        codigo,
        nombreResponsable: dto.nombreResponsable,
        vehiculo: dto.vehiculo,
        conductor: dto.conductor,
        fechaSalida: dto.fechaSalida ? new Date(dto.fechaSalida) : undefined,
        fechaEstimada: dto.fechaEstimada ? new Date(dto.fechaEstimada) : undefined,
        fechaLlegada: dto.fechaLlegada ? new Date(dto.fechaLlegada) : undefined,
        observaciones: dto.observaciones,
        estado: 'PLANIFICADO',
        campaniaId: dto.campaniaId,
        origenId: dto.origenId,
        destinoId: dto.destinoId,
        responsableId: dto.responsableId,
        detalles: {
          createMany: {
            data: dto.detalles.map((d) => ({
              cantidad: d.cantidad,
              loteId: d.loteId,
            })),
          },
        },
      },
      include: this.include,
    })
  }

  async actualizar(id: number, dto: UpdateViajeDto) {
    const viaje = await this.obtener(id)

    if (viaje.estado !== 'PLANIFICADO') {
      throw new BadRequestException('Solo se puede editar un viaje en estado PLANIFICADO')
    }

    const { detalles, ...rest } = dto

    const data: any = {}
    for (const [key, value] of Object.entries(rest)) {
      if (value === undefined) continue
      if (key.startsWith('fecha')) {
        data[key] = new Date(value)
      } else {
        data[key] = value
      }
    }

    if (dto.origenId && dto.origenId !== viaje.origenId) {
      await this.validarOrigen(dto.origenId)
    }

    return this.prisma.$transaction(async (tx) => {
      if (detalles !== undefined) {
        await tx.detalleViaje.deleteMany({ where: { viajeId: id } })
        await tx.detalleViaje.createMany({
          data: detalles.map((d) => ({
            viajeId: id,
            cantidad: d.cantidad,
            loteId: d.loteId,
          })),
        })
      }

      return tx.viaje.update({
        where: { id },
        data,
        include: this.include,
      })
    })
  }

  async eliminar(id: number) {
    await this.obtener(id)
    await this.prisma.viaje.delete({ where: { id } })
  }

  async lotesDisponibles(origenId: number) {
    await this.validarOrigen(origenId)

    const lotes = await this.prisma.lote.findMany({
      where: {
        ubicacionId: origenId,
        estado: 'DISPONIBLE',
        cantidad: { gt: 0 },
      },
      include: {
        producto: { include: { categoria: true } },
        donante: true,
        ubicacion: { include: { tipo: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const agrupados = lotes.reduce((acc, lote) => {
      const key = lote.productoId
      if (!acc[key]) {
        acc[key] = {
          producto: lote.producto,
          total: 0,
          lotes: [],
        }
      }
      acc[key].total += lote.cantidad
      acc[key].lotes.push({
        id: lote.id,
        codigo: lote.codigo,
        cantidad: lote.cantidad,
        donante: lote.donante?.nombre ?? null,
        fecha: lote.fecha,
      })
      return acc
    }, {} as Record<number, { producto: any; total: number; lotes: any[] }>)

    return Object.values(agrupados).map((g) => ({
      productoId: g.producto.id,
      producto: {
        id: g.producto.id,
        nombre: g.producto.nombre,
        categoria: g.producto.categoria ?? null,
        unidad: g.producto.unidad,
      },
      categoria: g.producto.categoria?.nombre ?? null,
      unidad: g.producto.unidad,
      totalDisponible: g.total,
      lotes: g.lotes,
    }))
  }

  private readonly TRANSICIONES_VALIDAS: Record<EstadoViaje, EstadoViaje[]> = {
    PLANIFICADO: ['EN_TRANSITO', 'CANCELADO'],
    EN_TRANSITO: ['COMPLETADO', 'RECEPCION_PARCIAL', 'CANCELADO'],
    RECEPCION_PARCIAL: ['COMPLETADO'],
    COMPLETADO: [],
    CANCELADO: [],
  }

  private validarTransicion(estadoActual: EstadoViaje, nuevoEstado: EstadoViaje) {
    const permitidas = this.TRANSICIONES_VALIDAS[estadoActual] ?? []
    if (!permitidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición inválida: ${estadoActual} → ${nuevoEstado}. Permitidas: ${permitidas.join(', ')}`
      )
    }
  }

  async recibir(
    id: number,
    detalles: { loteId: number; cantidadRecibida: number; cantidadDanada?: number; observaciones?: string }[],
    options?: { observaciones?: string; responsableId?: number; user?: any }
  ) {
    const viaje = await this.obtener(id)

    // Validar que el usuario tenga acceso a este destino
    if (options?.user?.rol === 'RESPONSABLE_DESTINO') {
      if (!options.user.ubicacionId || options.user.ubicacionId !== viaje.destinoId) {
        throw new BadRequestException('No tiene permisos para recibir viajes de este destino')
      }
    }

    if (viaje.estado !== 'EN_TRANSITO') {
      throw new BadRequestException('Solo se puede recibir un viaje en estado EN_TRANSITO')
    }

    const envios = await this.prisma.detalleViaje.findMany({ where: { viajeId: id } })

    let completo = true
    for (const det of detalles) {
      const envio = envios.find(d => d.loteId === det.loteId)
      const recibido = det.cantidadRecibida + (det.cantidadDanada ?? 0)
      if (!envio || recibido !== envio.cantidad) {
        completo = false
        break
      }
    }

    const nuevoEstado = completo ? 'COMPLETADO' : 'RECEPCION_PARCIAL'

    return this.cambiarEstado(id, nuevoEstado, {
      detallesRecepcion: detalles,
      observaciones: options?.observaciones,
      responsableId: options?.responsableId,
    })
  }

  async cambiarEstado(
    id: number,
    nuevoEstado: EstadoViaje,
    options?: { observaciones?: string; responsableId?: number; detallesRecepcion?: { loteId: number; cantidadRecibida: number; cantidadDanada?: number; observaciones?: string }[] }
  ) {
    const viaje = await this.obtener(id)
    this.validarTransicion(viaje.estado, nuevoEstado)

    const { observaciones, responsableId, detallesRecepcion } = options ?? {}

    return this.prisma.$transaction(async (tx) => {
      const detalles = await tx.detalleViaje.findMany({
        where: { viajeId: id },
        include: { lote: true },
      })

      // PLANIFICADO → EN_TRANSITO: enviar lotes
      if (viaje.estado === 'PLANIFICADO' && nuevoEstado === 'EN_TRANSITO') {
        for (const det of detalles) {
          const lote = det.lote
          if (det.cantidad > lote.cantidad) {
            throw new BadRequestException(
              `Lote ${lote.codigo} tiene ${lote.cantidad} und, se intentan enviar ${det.cantidad}`
            )
          }

          let loteEnviadoId = lote.id

          if (det.cantidad < lote.cantidad) {
            await tx.lote.update({
              where: { id: lote.id },
              data: { cantidad: lote.cantidad - det.cantidad },
            })

            const nuevoLote = await tx.lote.create({
              data: {
                codigo: `${lote.codigo}-ENV-${Date.now().toString(36).toUpperCase()}`,
                cantidad: det.cantidad,
                estado: 'EN_TRANSITO',
                campaniaId: lote.campaniaId,
                ubicacionId: lote.ubicacionId,
                productoId: lote.productoId,
                donanteId: lote.donanteId,
                responsableId: lote.responsableId,
                observaciones: `Envío parcial desde lote ${lote.codigo} para viaje ${viaje.codigo}`,
              },
            })
            loteEnviadoId = nuevoLote.id
          } else {
            await tx.lote.update({
              where: { id: lote.id },
              data: { estado: 'EN_TRANSITO' },
            })
          }

          const ultimo = await tx.movimientoInventario.findFirst({
            where: { loteId: loteEnviadoId, ubicacionId: viaje.origenId },
            orderBy: { createdAt: 'desc' },
          })
          const saldoAnterior = ultimo?.saldoNuevo ?? 0

          await tx.movimientoInventario.create({
            data: {
              tipo: 'ENVIO',
              cantidad: det.cantidad,
              saldoAnterior,
              saldoNuevo: Math.max(0, saldoAnterior - det.cantidad),
              observaciones: `Envío en viaje ${viaje.codigo}${observaciones ? ': ' + observaciones : ''}`,
              loteId: loteEnviadoId,
              ubicacionId: viaje.origenId,
              campaniaId: viaje.campaniaId,
              viajeId: id,
            },
          })

          if (det.cantidad < lote.cantidad) {
            const ultimoOriginal = await tx.movimientoInventario.findFirst({
              where: { loteId: lote.id, ubicacionId: viaje.origenId },
              orderBy: { createdAt: 'desc' },
            })
            const saldoOriginal = ultimoOriginal?.saldoNuevo ?? 0
            await tx.movimientoInventario.create({
              data: {
                tipo: 'AJUSTE',
                cantidad: det.cantidad,
                saldoAnterior: saldoOriginal,
                saldoNuevo: saldoOriginal - det.cantidad,
                observaciones: `Ajuste por envío parcial del lote ${lote.codigo}`,
                loteId: lote.id,
                ubicacionId: viaje.origenId,
                campaniaId: viaje.campaniaId,
                viajeId: id,
              },
            })
          }
        }
      }

      // EN_TRANSITO → COMPLETADO / RECEPCION_PARCIAL: procesar recepción
      if (viaje.estado === 'EN_TRANSITO' && (nuevoEstado === 'COMPLETADO' || nuevoEstado === 'RECEPCION_PARCIAL')) {
        if (!detallesRecepcion?.length) {
          throw new BadRequestException('Debe proporcionar detalles de recepción (detallesRecepcion)')
        }

        const detalleViajeMap = new Map(detalles.map(d => [d.loteId, d]))

        // Crear registro de Recepcion
        await tx.recepcion.create({
          data: {
            fecha: new Date(),
            viajeId: id,
            responsableId,
            detalles: {
              createMany: {
                data: detallesRecepcion.map(d => ({
                  cantidadRecibida: d.cantidadRecibida,
                  cantidadDanada: d.cantidadDanada ?? 0,
                  cantidadFaltante: Math.max(0, (detalleViajeMap.get(d.loteId)?.cantidad ?? 0) - d.cantidadRecibida - (d.cantidadDanada ?? 0)),
                  observaciones: d.observaciones,
                  loteId: d.loteId,
                })),
              },
            },
          },
        })

        for (const detRec of detallesRecepcion) {
          const lote = await tx.lote.findUnique({ where: { id: detRec.loteId } })
          if (!lote) continue

          const detViaje = detalleViajeMap.get(detRec.loteId)
          const cantidadEnviada = detViaje?.cantidad ?? 0
          const faltante = cantidadEnviada - detRec.cantidadRecibida

          if (detRec.cantidadRecibida > 0) {
            await tx.lote.update({
              where: { id: detRec.loteId },
              data: {
                ubicacionId: viaje.destinoId,
                cantidad: detRec.cantidadRecibida,
                estado: 'ENTREGADO',
              },
            })

            const ultimoDestino = await tx.movimientoInventario.findFirst({
              where: { loteId: detRec.loteId, ubicacionId: viaje.destinoId },
              orderBy: { createdAt: 'desc' },
            })
            const saldoAnteriorDestino = ultimoDestino?.saldoNuevo ?? 0

            await tx.movimientoInventario.create({
              data: {
                tipo: 'RECEPCION',
                cantidad: detRec.cantidadRecibida,
                saldoAnterior: saldoAnteriorDestino,
                saldoNuevo: saldoAnteriorDestino + detRec.cantidadRecibida,
                observaciones: nuevoEstado === 'COMPLETADO'
                  ? `Recepción completa viaje ${viaje.codigo}${observaciones ? ': ' + observaciones : ''}`
                  : `Recepción parcial viaje ${viaje.codigo} (${detRec.cantidadRecibida}/${cantidadEnviada})${observaciones ? ': ' + observaciones : ''}`,
                loteId: detRec.loteId,
                ubicacionId: viaje.destinoId,
                campaniaId: viaje.campaniaId,
                viajeId: id,
              },
            })
          }

          if (faltante > 0 && nuevoEstado === 'RECEPCION_PARCIAL') {
            await tx.lote.create({
              data: {
                codigo: `${lote.codigo}-FALTANTE-${Date.now().toString(36).toUpperCase()}`,
                cantidad: faltante,
                estado: 'ENTREGADO',
                campaniaId: lote.campaniaId,
                ubicacionId: viaje.origenId,
                productoId: lote.productoId,
                donanteId: lote.donanteId,
                responsableId: lote.responsableId,
                observaciones: `Faltante recepción viaje ${viaje.codigo} (${faltante} und no llegaron)`,
              },
            })
          }

          if (detRec.cantidadDanada && detRec.cantidadDanada > 0) {
            await tx.lote.create({
              data: {
                codigo: `${lote.codigo}-DANIADO-${Date.now().toString(36).toUpperCase()}`,
                cantidad: detRec.cantidadDanada,
                estado: 'ENTREGADO',
                campaniaId: lote.campaniaId,
                ubicacionId: viaje.destinoId,
                productoId: lote.productoId,
                donanteId: lote.donanteId,
                responsableId: lote.responsableId,
                observaciones: `Dañado en recepción viaje ${viaje.codigo} (${detRec.cantidadDanada} und)`,
              },
            })
          }

        }
      }

      // CANCELADO: revertir
      if (nuevoEstado === 'CANCELADO') {
        const movimientos = await tx.movimientoInventario.findMany({
          where: { viajeId: id },
          orderBy: { createdAt: 'desc' },
        })

        for (const mov of movimientos) {
          if (mov.tipo === 'ENVIO') {
            const ultimo = await tx.movimientoInventario.findFirst({
              where: { loteId: mov.loteId, ubicacionId: viaje.origenId },
              orderBy: { createdAt: 'desc' },
            })
            const saldoAnterior = ultimo?.saldoNuevo ?? 0
            await tx.movimientoInventario.create({
              data: {
                tipo: 'AJUSTE',
                cantidad: mov.cantidad,
                saldoAnterior,
                saldoNuevo: saldoAnterior + mov.cantidad,
                observaciones: `Reversión por cancelación viaje ${viaje.codigo} (${mov.tipo})`,
                loteId: mov.loteId,
                ubicacionId: viaje.origenId,
                campaniaId: viaje.campaniaId,
                viajeId: id,
              },
            })

            await tx.lote.update({
              where: { id: mov.loteId },
              data: { estado: 'DISPONIBLE' },
            })
          }
        }
      }

      return tx.viaje.update({
        where: { id },
        data: {
          estado: nuevoEstado,
          observaciones: observaciones
            ? `${viaje.observaciones ?? ''}\n[${new Date().toISOString()}] ${nuevoEstado}: ${observaciones}`.trim()
            : viaje.observaciones,
        },
        include: this.include,
      })
    })
  }

  async listarRecepciones() {
    return this.prisma.recepcion.findMany({
      include: {
        viaje: { select: { codigo: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
