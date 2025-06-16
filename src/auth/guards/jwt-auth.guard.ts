import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Decide se a rota é pública ou se deve aplicar o guard JWT.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Chama o AuthGuard padrão para validar o token e povoar request.user
    const can = (await super.canActivate(context)) as boolean;
    if (!can) {
      return false;
    }

    // Chama handleRequest para lançar exceção se user for inválido
    const request = context.switchToHttp().getRequest();
    return this.handleRequest(null, request.user, null, context);
  }

  /**
   * Recebe o resultado do PassportStrategy e decide se lança erro ou retorna o user.
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException('Token de autenticação inválido ou ausente');
    }
    return user;
  }
}
