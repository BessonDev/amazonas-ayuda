import { Controller, Post, Headers, Body, Logger } from '@nestjs/common'
import { ApiExcludeEndpoint } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { TelegramService } from './telegram.service'

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
