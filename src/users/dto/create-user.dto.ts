import { IsIn, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

/**
 * DTO para criação de um novo usuário.
 * Sempre atribui role 'user' por padrão.
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'Nome de usuário único',
    example: 'johndoe',
  })
  @IsString({ message: 'O username deve ser uma string' })
  username: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 's3cr3t123',
    minLength: 6,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, {
    message: 'A senha deve ter no mínimo $constraint1 caracteres',
  })
  password: string;

  @ApiProperty({ description: 'Papel do usuário', enum: ['admin', 'user'], example: 'user', required: false })
  @IsIn(['admin', 'user'])
  role?: UserRole = 'user'; // Define 'user' como padrão se não for especificado
}
