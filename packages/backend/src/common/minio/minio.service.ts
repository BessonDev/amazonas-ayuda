import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client
  private bucket: string

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const endpoint = this.config.get<string>('MINIO_ENDPOINT', 'localhost')
    const port = this.config.get<number>('MINIO_PORT', 9000)
    const accessKey = this.config.get<string>('MINIO_ACCESS_KEY', 'minioadmin')
    const secretKey = this.config.get<string>('MINIO_SECRET_KEY', 'minioadmin')
    const useSSL = this.config.get<string>('MINIO_USE_SSL', 'false') === 'true'
    const region = this.config.get<string>('MINIO_REGION', 'us-east-1')
    this.bucket = this.config.get<string>('MINIO_BUCKET', 'donaciones-amazonas')

    this.client = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
      region,
    })
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket)
    if (!exists) {
      await this.client.makeBucket(this.bucket)
    }
  }

  async upload(filename: string, buffer: Buffer, mimeType: string): Promise<string> {
    await this.ensureBucket()
    await this.client.putObject(this.bucket, filename, buffer, buffer.length, {
      'Content-Type': mimeType,
    })
    return filename
  }

  async getStream(filename: string) {
    await this.ensureBucket()
    return this.client.getObject(this.bucket, filename)
  }

  async remove(filename: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, filename)
    } catch {}
  }
}
