import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Telegraf } from 'telegraf'
import { formatSolicitudCreada, formatSolicitudCompletada } from './formatters/solicitud.formatter'
import { formatViajeCreado, formatViajeActualizado, formatViajeRecibido } from './formatters/viaje.formatter'

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name)
  private bot: Telegraf
  private chatId: string
  private webhookSecret: string

  constructor(private config: ConfigService) {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN')
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN no configurado — bot deshabilitado')
      return
    }
    this.bot = new Telegraf(token)
    this.chatId = this.config.get<string>('TELEGRAM_CHAT_ID') ?? ''
    this.webhookSecret = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET') ?? ''
  }

  async onModuleInit() {
    if (!this.bot) return

    this.bot.start((ctx) => {
      const nombre = ctx.from?.first_name ?? ''
      ctx.reply(
        `¡Hola ${nombre}! Soy el bot de *La Red Solidaria*.\n\n` +
        'Recibirás notificaciones sobre solicitudes y viajes en este grupo.\n\n' +
        'Comandos disponibles:\n' +
        '/ayuda — Muestra esta ayuda\n' +
        '/estado — Resumen rápido del sistema',
        { parse_mode: 'Markdown' }
      )
    })

    this.bot.help((ctx) => {
      ctx.reply(
        '*Comandos disponibles:*\n\n' +
        '/start — Iniciar bot\n' +
        '/ayuda — Mostrar esta ayuda\n' +
        '/estado — Resumen rápido del sistema\n\n' +
        '_Las notificaciones se envían automáticamente cuando ocurren eventos._',
        { parse_mode: 'Markdown' }
      )
    })

    this.bot.command('ayuda', (ctx) => {
      ctx.reply(
        '*Comandos disponibles:*\n\n' +
        '/start — Iniciar bot\n' +
        '/ayuda — Mostrar esta ayuda\n' +
        '/estado — Resumen rápido del sistema\n\n' +
        '_Las notificaciones se envían automáticamente cuando ocurren eventos._',
        { parse_mode: 'Markdown' }
      )
    })

    this.bot.command('estado', async (ctx) => {
      try {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()
        const [solicitudes, viajes, lotes, solicitudesPendientes, campaniasActivas] = await Promise.all([
          prisma.solicitud.count({ where: { estado: 'APROBADA' } }),
          prisma.viaje.count({ where: { estado: { in: ['PLANIFICADO', 'EN_TRANSITO'] } } }),
          prisma.lote.count({ where: { deletedAt: null } }),
          prisma.solicitud.count({ where: { estado: 'ABIERTA' } }),
          prisma.campania.count({ where: { estado: 'ACTIVA' } }),
        ])
        await prisma.$disconnect()
        ctx.reply(
          '📊 *Resumen del sistema*\n\n' +
          `• Solicitudes activas: ${solicitudes}\n` +
          `• Solicitudes pendientes: ${solicitudesPendientes}\n` +
          `• Campañas activas: ${campaniasActivas}\n` +
          `• Viajes en curso: ${viajes}\n` +
          `• Lotes registrados: ${lotes}`,
          { parse_mode: 'Markdown' }
        )
      } catch {
        ctx.reply('❌ Error al obtener el estado del sistema.')
      }
    })

    const webhookUrl = this.config.get<string>('TELEGRAM_WEBHOOK_URL')
      ?? `${this.config.get<string>('FRONTEND_URL') ?? 'https://laredsolidaria.org'}/api/telegram/webhook`
    if (webhookUrl) {
      try {
        await this.bot.telegram.setWebhook(webhookUrl, {
          secret_token: this.webhookSecret,
        })
        this.logger.log(`Webhook registrado: ${webhookUrl}`)
      } catch (err) {
        this.logger.error('Error al registrar webhook', err)
      }
    }
  }

  getBot(): Telegraf | undefined {
    return this.bot
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.bot || !this.chatId) return

    const maxRetries = 3
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.bot.telegram.sendMessage(this.chatId, text, {
          parse_mode: 'MarkdownV2',
        })
        return
      } catch (error) {
        this.logger.warn(`Telegram sendMessage intento ${attempt}/${maxRetries} falló`)
        if (attempt === maxRetries) {
          this.logger.error('Telegram sendMessage falló tras 3 intentos', error)
          return
        }
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000))
      }
    }
  }

  async notifySolicitudCreada(solicitud: any): Promise<void> {
    const text = formatSolicitudCreada(solicitud)
    return this.sendMessage(text)
  }

  async notifySolicitudCompletada(solicitud: any): Promise<void> {
    const text = formatSolicitudCompletada(solicitud)
    return this.sendMessage(text)
  }

  async notifyViajeCreado(viaje: any): Promise<void> {
    const text = formatViajeCreado(viaje)
    return this.sendMessage(text)
  }

  async notifyViajeActualizado(viaje: any, cambios?: string): Promise<void> {
    const text = formatViajeActualizado(viaje, cambios)
    return this.sendMessage(text)
  }

  async notifyViajeRecibido(viaje: any): Promise<void> {
    const text = formatViajeRecibido(viaje)
    return this.sendMessage(text)
  }
}
