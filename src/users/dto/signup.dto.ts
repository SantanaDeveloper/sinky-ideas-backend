import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO para autenticação de usuário (signup/login).
 */
export class SignupDto {
  @ApiProperty({
    description: 'Nome de usuário único no sistema',
    example: 'jane_doe',
  })
  @IsString({ message: 'O nome de usuário deve ser uma string' })
  @IsNotEmpty({ message: 'O nome de usuário não pode ficar em branco' })
  username: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'strongP@ssw0rd',
    minLength: 6,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, {
    message: 'A senha deve ter pelo menos $constraint1 caracteres',
  })
  password: string;
}
