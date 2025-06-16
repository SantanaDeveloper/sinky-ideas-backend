import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

/**
 * DTO de usuário exposto pela API, sem dados sensíveis.
 */
export class UserDto {
  @ApiProperty({
    description: 'Identificador único do usuário (UUID)',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string;

  @ApiProperty({
    description: 'Nome de usuário',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'Papel do usuário',
    enum: ['admin', 'user'],
    example: 'user',
  })
  role: UserRole;
}
