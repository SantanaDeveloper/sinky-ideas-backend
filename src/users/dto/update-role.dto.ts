import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { UserRole } from '../entities/user.entity';

/**
 * DTO para atualização da role de um usuário.
 * Utilizado apenas por administradores para alterar o papel de outros usuários.
 */
export class UpdateRoleDto {
  @ApiProperty({
    description: 'Novo papel do usuário',
    enum: ['admin', 'user'],
    example: 'user',
  })
  @IsIn(['admin', 'user'], {
    message: `Role inválida. Deve ser 'admin' ou 'user'`,
  })
  role: UserRole;
}
