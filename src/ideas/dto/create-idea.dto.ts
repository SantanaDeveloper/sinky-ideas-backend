import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para criação de uma nova ideia.
 */
export class CreateIdeaDto {
  @ApiProperty({
    description: 'Título da ideia',
    minLength: 1,
    maxLength: 255,
    example: 'Implementar dark mode no app',
  })
  @IsString({ message: 'O título deve ser uma string' })
  @MinLength(1, { message: 'O título não pode ser vazio' })
  @MaxLength(255, { message: 'O título pode ter no máximo 255 caracteres' })
  title: string;
}
