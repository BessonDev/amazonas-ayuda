import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateViajeDto } from './dto/create-viaje.dto'
import { UpdateViajeDto } from './dto/update-viaje.dto'
import { EstadoViaje, EstadoLote, TipoMovimiento, Prisma } from '@prisma/client'

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

  private readonly TIPOS_ORIGEN_PERMITIDOS = ['CENTRO_ACOPIO', 'BODEGA']

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
      throw new BadRequestException('El origen del viaje debe ser un Centro de Acopio o Bodega')
    }
    return origen
  }

  async listar() {
    return this.prisma.viaje.findMany({
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
        estado: dto.estado,
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

    // Validar origen si se está cambiando
    if (dto.origenId && dto.origenId !== viaje.origenId) {
      await this.validarOrigen(dto.origenId)
    }

    const transito = rest.estado === 'EN_TRANSITO' && viaje.estado !== 'EN_TRANSITO'

    if (transito) {
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

        const updated = await tx.viaje.update({
          where: { id },
          data,
          include: this.include,
        })

        const detallesList = detalles ?? viaje.detalles

        for (const det of detallesList) {
          const ultimo = await tx.movimientoInventario.findFirst({
            where: { loteId: det.loteId, ubicacionId: viaje.origenId },
            orderBy: { createdAt: 'desc' },
          })

          const saldoAnterior = ultimo?.saldoNuevo ?? 0
          const saldoNuevo = Math.max(0, saldoAnterior - det.cantidad)

          await tx.movimientoInventario.create({
            data: {
              tipo: 'ENVIO',
              cantidad: det.cantidad,
              saldoAnterior,
              saldoNuevo,
              observaciones: `Envío en viaje ${viaje.codigo}`,
              loteId: det.loteId,
              ubicacionId: viaje.origenId,
              campaniaId: viaje.campaniaId,
              viajeId: id,
            },
          })

          await tx.lote.update({
            where: { id: det.loteId },
            data: { estado: 'EN_TRANSITO' },
          })
        }

        return updated
      })
    }

    if (detalles !== undefined) {
      await this.prisma.detalleViaje.deleteMany({ where: { viajeId: id } })
      await this.prisma.detalleViaje.createMany({
        data: detalles.map((d) => ({
          viajeId: id,
          cantidad: d.cantidad,
          loteId: d.loteId,
        })),
      })
    }

    return this.prisma.viaje.update({
      where: { id },
      data,
      include: this.include,
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
        estado: { in: ['DISPONIBLE', 'RESERVADO'] },
        cantidad: { gt: 0 },
        esSplit: false,
      },
      include: {
        producto: { include: { categoria: true } },
        donante: true,
        ubicacion: { include: { tipo: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Agrupar por productoId - consolidación FIFO
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
        estado: lote.estado,
        donante: lote.donante?.nombre ?? null,
        fecha: lote.fecha,
      })
      return acc
    }, {} as Record<number, { producto: any; total: number; lotes: any[] }>)

    return Object.values(agrupados).map((g) => ({
      productoId: g.producto.id,
      producto: g.producto.nombre,
      categoria: g.producto.categoria?.nombre ?? null,
      unidad: g.producto.unidad,
      totalDisponible: g.total,
      lotes: g.lotes, // ya ordenados FIFO por createdAt
    }))
  }

  private readonly TRANSICIONES_VALIDAS: Record<EstadoViaje, EstadoViaje[]> = {
    PLANIFICADO: ['PREPARANDO_CARGA', 'CANCELADO'],
    PREPARANDO_CARGA: ['EN_TRANSITO', 'PLANIFICADO', 'CANCELADO'],
    EN_TRANSITO: ['LLEGO', 'CANCELADO'],
    LLEGO: ['COMPLETADO', 'RECEPCION_PARCIAL', 'EN_TRANSITO'],
    COMPLETADO: [],
    RECEPCION_PARCIAL: ['COMPLETADO'],
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

  async cambiarEstado(id: number, nuevoEstado: EstadoViaje, observaciones?: string) {
    const viaje = await this.obtener(id)
    this.validarTransicion(viaje.estado, nuevoEstado)

    return this.prisma.$transaction(async (tx) => {
      const detalles = await tx.detalleViaje.findMany({
        where: { viajeId: id },
        include: { lote: true },
      })

      // 1. PLANIFICADO → PREPARANDO_CARGA: Reservar stock
      if (viaje.estado === 'PLANIFICADO' && nuevoEstado === 'PREPARANDO_CARGA') {
        for (const det of detalles) {
          const lote = det.lote
          if (det.cantidad > lote.cantidad) {
            throw new BadRequestException(
              `Lote ${lote.codigo} tiene ${lote.cantidad} und, se intentan reservar ${det.cantidad}`
            )
          }

          // Si es envío parcial, crear lote hijo (split)
          let loteIdParaReserva = lote.id
          let cantidadReserva = det.cantidad

          if (det.cantidad < lote.cantidad) {
            // Crear lote hijo para la parte que viaja
            const loteHijo = await tx.lote.create({
              data: {
                codigo: `${lote.codigo}-SPLIT-${Date.now().toString(36).toUpperCase()}`,
                cantidad: det.cantidad,
                estado: 'RESERVADO',
                campaniaId: lote.campaniaId,
                ubicacionId: lote.ubicacionId,
                productoId: lote.productoId,
                donanteId: lote.donanteId,
                responsableId: lote.responsableId,
                lotePadreId: lote.id,
                esSplit: true,
                observaciones: `Split para viaje ${viaje.codigo} (${det.cantidad} de ${lote.cantidad})`,
              },
            })
            // Reducir lote padre
            await tx.lote.update({
              where: { id: lote.id },
              data: { cantidad: lote.cantidad - det.cantidad },
            })
            loteIdParaReserva = loteHijo.id
            cantidadReserva = det.cantidad
          } else {
            // Reserva completa del lote
            await tx.lote.update({
              where: { id: lote.id },
              data: { estado: 'RESERVADO' },
            })
          }

          // Movimiento RESERVA
          const ultimo = await tx.movimientoInventario.findFirst({
            where: { loteId: loteIdParaReserva, ubicacionId: viaje.origenId },
            orderBy: { createdAt: 'desc' },
          })
          const saldoAnterior = ultimo?.saldoNuevo ?? 0
          await tx.movimientoInventario.create({
            data: {
              tipo: 'RESERVA',
              cantidad: cantidadReserva,
              saldoAnterior,
              saldoNuevo: saldoAnterior - cantidadReserva,
              observaciones: `Reserva para viaje ${viaje.codigo}${observaciones ? ': ' + observaciones : ''}`,
              loteId: loteIdParaReserva,
              ubicacionId: viaje.origenId,
              campaniaId: viaje.campaniaId,
              viajeId: id,
            },
          })
        }
      }

      // 2. PREPARANDO_CARGA → EN_TRANSITO: Convertir reserva en envío
      if (viaje.estado === 'PREPARANDO_CARGA' && nuevoEstado === 'EN_TRANSITO') {
        for (const det of detalles) {
          const lote = det.lote
          await tx.lote.update({
            where: { id: lote.id },
            data: { estado: 'EN_TRANSITO' },
          })

          const ultimo = await tx.movimientoInventario.findFirst({
            where: { loteId: lote.id, ubicacionId: viaje.origenId },
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
              loteId: lote.id,
              ubicacionId: viaje.origenId,
              campaniaId: viaje.campaniaId,
              viajeId: id,
            },
          })
        }
      }

      // 3. EN_TRANSITO → LLEGO: Solo cambio de estado (esperando recepción)
      // 4. LLEGO → COMPLETADO / RECEPCION_PARCIAL: Procesar recepción
      if (viaje.estado === 'LLEGO' && (nuevoEstado === 'COMPLETADO' || nuevoEstado === 'RECEPCION_PARCIAL')) {
        const recepcion = await tx.recepcion.findFirst({
          where: { viajeId: id },
          include: {
            detalles: {
              include: { lote: true },
            },
          },
        })
        if (!recepcion) {
          throw new BadRequestException('No existe recepción para este viaje. Cree la recepción primero.')
        }

        // Mapa de loteId -> detalleViaje para obtener cantidadEnviada
        const detalleViajeMap = new Map(detalles.map(d => [d.loteId, d]))

        for (const detRec of recepcion.detalles) {
          const lote = detRec.lote
          const detViaje = detalleViajeMap.get(lote.id)
          const cantidadEnviada = detViaje?.cantidad ?? 0

          if (nuevoEstado === 'COMPLETADO') {
            // Recepción completa
            await tx.lote.update({
              where: { id: lote.id },
              data: {
                ubicacionId: viaje.destinoId,
                cantidad: detRec.cantidadRecibida,
                estado: 'VERIFICADO',
              },
            })

            // Movimiento RECEPCION en destino
            const ultimoDestino = await tx.movimientoInventario.findFirst({
              where: { loteId: lote.id, ubicacionId: viaje.destinoId },
              orderBy: { createdAt: 'desc' },
            })
            const saldoAnteriorDestino = ultimoDestino?.saldoNuevo ?? 0
            await tx.movimientoInventario.create({
              data: {
                tipo: 'RECEPCION',
                cantidad: detRec.cantidadRecibida,
                saldoAnterior: saldoAnteriorDestino,
                saldoNuevo: saldoAnteriorDestino + detRec.cantidadRecibida,
                observaciones: `Recepción completa viaje ${viaje.codigo}${observaciones ? ': ' + observaciones : ''}`,
                loteId: lote.id,
                ubicacionId: viaje.destinoId,
                campaniaId: viaje.campaniaId,
                viajeId: id,
              },
            })
          } else {
            // RECEPCION_PARCIAL: recibido < enviado
            const cantidadRecibida = detRec.cantidadRecibida
            const cantidadEnviada = detViaje?.cantidad ?? 0
            const faltante = cantidadEnviada - cantidadRecibida

            if (cantidadRecibida > 0) {
              // Lote recibido → VERIFICADO en destino
              await tx.lote.update({
                where: { id: lote.id },
                data: {
                  ubicacionId: viaje.destinoId,
                  cantidad: cantidadRecibida,
                  estado: 'VERIFICADO',
                },
              })

              const ultimoDestino = await tx.movimientoInventario.findFirst({
                where: { loteId: lote.id, ubicacionId: viaje.destinoId },
                orderBy: { createdAt: 'desc' },
              })
              const saldoAnteriorDestino = ultimoDestino?.saldoNuevo ?? 0
              await tx.movimientoInventario.create({
                data: {
                  tipo: 'RECEPCION',
                  cantidad: cantidadRecibida,
                  saldoAnterior: saldoAnteriorDestino,
                  saldoNuevo: saldoAnteriorDestino + cantidadRecibida,
                  observaciones: `Recepción parcial viaje ${viaje.codigo} (${cantidadRecibida}/${cantidadEnviada})${observaciones ? ': ' + observaciones : ''}`,
                  loteId: lote.id,
                  ubicacionId: viaje.destinoId,
                  campaniaId: viaje.campaniaId,
                  viajeId: id,
                },
              })
            }

            // Faltante → crear lote hijo con estado AJUSTE en origen (o mantener en tránsito si se espera)
            if (faltante > 0) {
              await tx.lote.create({
                data: {
                  codigo: `${lote.codigo}-FALTANTE-${Date.now().toString(36).toUpperCase()}`,
                  cantidad: faltante,
                  estado: 'AJUSTE',
                  campaniaId: lote.campaniaId,
                  ubicacionId: viaje.origenId, // queda en origen conceptualmente
                  productoId: lote.productoId,
                  donanteId: lote.donanteId,
                  responsableId: lote.responsableId,
                  lotePadreId: lote.id,
                  esSplit: true,
                  observaciones: `Faltante recepción viaje ${viaje.codigo} (${faltante} und no llegaron)`,
                },
              })

              // Movimiento AJUSTE en origen por faltante
              const ultimoOrigen = await tx.movimientoInventario.findFirst({
                where: { loteId: lote.id, ubicacionId: viaje.origenId },
                orderBy: { createdAt: 'desc' },
              })
              const saldoAnteriorOrigen = ultimoOrigen?.saldoNuevo ?? 0
              await tx.movimientoInventario.create({
                data: {
                  tipo: 'AJUSTE',
                  cantidad: faltante,
                  saldoAnterior: saldoAnteriorOrigen,
                  saldoNuevo: saldoAnteriorOrigen - faltante,
                  observaciones: `Ajuste faltante recepción viaje ${viaje.codigo}`,
                  loteId: lote.id,
                  ubicacionId: viaje.origenId,
                  campaniaId: viaje.campaniaId,
                  viajeId: id,
                },
              })
            }
          }

          // Dañado → lote hijo separado
          if (detRec.cantidadDanada && detRec.cantidadDanada > 0) {
            await tx.lote.create({
              data: {
                codigo: `${lote.codigo}-DANIADO-${Date.now().toString(36).toUpperCase()}`,
                cantidad: detRec.cantidadDanada,
                estado: 'AJUSTE',
                campaniaId: lote.campaniaId,
                ubicacionId: viaje.destinoId,
                productoId: lote.productoId,
                donanteId: lote.donanteId,
                responsableId: lote.responsableId,
                lotePadreId: lote.id,
                esSplit: true,
                observaciones: `Dañado en recepción viaje ${viaje.codigo} (${detRec.cantidadDanada} und)`,
              },
            })
          }
        }
      }

      // 5. CANCELADO desde cualquier estado: revertir
      if (nuevoEstado === 'CANCELADO') {
        // Revertir movimientos según estado actual
        const movimientos = await tx.movimientoInventario.findMany({
          where: { viajeId: id },
          orderBy: { createdAt: 'desc' },
        })

        for (const mov of movimientos) {
          if (mov.tipo === 'RESERVA' || mov.tipo === 'ENVIO') {
            // Reponer en origen
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

            // Si es lote split (esSplit), fusionar de vuelta al padre
            const lote = await tx.lote.findUnique({ where: { id: mov.loteId } })
            if (lote?.esSplit && lote.lotePadreId) {
              await tx.lote.update({
                where: { id: lote.lotePadreId },
                data: { cantidad: { increment: lote.cantidad } },
              })
              await tx.lote.delete({ where: { id: lote.id } })
            } else {
              await tx.lote.update({
                where: { id: mov.loteId },
                data: { estado: 'DISPONIBLE' },
              })
            }
          }
        }
      }

      // Actualizar estado del viaje
      const updated = await tx.viaje.update({
        where: { id },
        data: {
          estado: nuevoEstado,
          observaciones: observaciones ? `${viaje.observaciones ?? ''}\n[${new Date().toISOString()}] ${nuevoEstado}: ${observaciones}`.trim() : viaje.observaciones,
        },
        include: this.include,
      })

      return updated
    })
  }
}
