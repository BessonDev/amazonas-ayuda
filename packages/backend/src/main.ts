import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000')
  const port = configService.get('PORT', 4000)

  app.setGlobalPrefix('api')
  app.use(cookieParser())

  app.enableCors({
    origin(origin: string | undefined, callback: (err: Error | null, allowed?: boolean) => void) {
      const allowedOrigins = [
        frontendUrl,
        'http://localhost:3000',
        'http://localhost:4173',
        ...configService.get('CORS_ORIGINS', '').split(',').filter(Boolean),
      ]
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} no permitido por CORS`))
      }
    },
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Donaciones Amazonas API')
    .setDescription('API de gestión logística para donaciones humanitarias')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(port)
  console.log(`🚀 Servidor iniciado en http://localhost:${port}`)
  console.log(`📚 Documentación API en http://localhost:${port}/api/docs`)
}

bootstrap()
