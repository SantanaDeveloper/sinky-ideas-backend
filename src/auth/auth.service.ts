import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  username: string;
  sub: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Valida usuário e senha. Se válidos, retorna o objeto user sem a senha.
   * @throws UnauthorizedException se credenciais inválidas
   */
  async validateUser(username: string, plaintextPassword: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const passwordMatches = await bcrypt.compare(
      plaintextPassword,
      user.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // remove senha antes de retornar
    const { password, ...result } = user;
    return result;
  }

  /**
   * Gera e retorna um JWT para o usuário autenticado.
   */
  async login(user: { username: string; id: string; role: string }) {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };

    const pollsVoted = await this.usersService.getVotedIdeaIds(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      votedPolls: pollsVoted,
    };
  }
}
