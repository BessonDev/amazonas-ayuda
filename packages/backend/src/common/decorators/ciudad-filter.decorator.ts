import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CiudadFilter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.ciudadFilter;
  },
);