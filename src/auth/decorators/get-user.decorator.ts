import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Injeta o usuário autenticado (req.user) ou uma de suas propriedades.
 * Deve ser usado apenas em rotas protegidas por JwtAuthGuard.
 */
export function getUserFromRequest(
  data: keyof User | undefined,
  ctx: ExecutionContext,
): any {
  const request = ctx.switchToHttp().getRequest<{ user: User }>();
  const user = request.user;
  return data ? user?.[data] : user;
}

export const GetUser = createParamDecorator(getUserFromRequest);