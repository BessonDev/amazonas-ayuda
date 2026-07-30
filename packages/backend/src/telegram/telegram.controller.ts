import { Controller, Post, Headers, Body, Logger, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiExcludeEndpoint, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { TelegramService } from './telegram.service'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name)
  private readonly secretToken: string

  constructor(
    private readonly telegramService: TelegramService,
    private readonly config: ConfigService,
  ) {
    this.secretToken = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET') ?? ''
  }

  @Post('test')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Enviar mensaje de prueba al grupo de Telegram' })
  async test() {
    await this.telegramService.sendMessage(
      '🟢 *Prueba exitosa*\n\nEl bot de *La Red Solidaria* funciona correctamente\\!\n\n' +
      'Recibirás notificaciones de:\n' +
      '• Solicitudes nuevas y completadas\n' +
      '• Viajes creados y actualizados\n' +
      '• Recepciones de viajes'
    )
    return { ok: true, message: 'Mensaje de prueba enviado al grupo de Telegram' }
  }

  @Post('webhook')
  @ApiExcludeEndpoint()
  async webhook(
    @Body() update: any,
    @Headers('x-telegram-bot-api-secret-token') token?: string,
  ) {
    if (token && token !== this.secretToken) {
      this.logger.warn('Webhook recibido con secret_token inválido')
      return { ok: false }
    }

    const bot = this.telegramService.getBot()
    if (bot) {
      bot.handleUpdate(update).catch((err) => {
        this.logger.error('Error manejando update de Telegram', err)
      })
    }

    return { ok: true }
  }
}
