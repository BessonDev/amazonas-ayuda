import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface RespuestaEnvoltorio<T> {
  exito: boolean
  datos: T
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, RespuestaEnvoltorio<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<RespuestaEnvoltorio<T>> {
    return next.handle().pipe(
      map((data) => ({
        exito: true,
        datos: data,
      })),
    )
  }
}
