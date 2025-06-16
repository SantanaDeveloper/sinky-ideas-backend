import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new BadRequestException('JWT_SECRET não está definido');
    }

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    };

    super(options);
  }

  /**
   * Valida o payload do token.
   * Se chegar aqui, o token é válido.
   * Retorna o "user" que será injetado em Request.user pelo JwtAuthGuard.
   */
  async validate(payload: JwtPayload): Promise<{ id: number; username: string; role: string }> {
    if (!payload.sub || !payload.username) {
      throw new UnauthorizedException('Token inválido');
    }
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
