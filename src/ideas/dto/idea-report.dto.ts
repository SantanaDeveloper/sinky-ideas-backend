import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO usado para retornar um relatório detalhado de uma ideia,
 * incluindo quem foi o criador, quantos votos teve e quem votou.
 */
export class IdeaReportDto {
  @ApiProperty({
    description: 'Identificador único da ideia (UUID)',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string;

  @ApiProperty({
    description: 'Título da ideia',
    example: 'Implementar modo escuro no aplicativo',
  })
  title: string;

  @ApiProperty({
    description: 'Nome de usuário do criador da ideia',
    example: 'adminUser',
  })
  creator: string;

  @ApiProperty({
    description: 'Número total de votos recebidos',
    example: 5,
  })
  votesCount: number;

  @ApiProperty({
    description: 'Lista de nomes de usuários que votaram nesta ideia',
    type: [String],
    example: ['alice', 'bob', 'charlie'],
  })
  voters: string[];
}
