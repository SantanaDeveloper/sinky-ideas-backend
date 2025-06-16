import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { User } from '../../users/entities/user.entity';
import { Idea } from './idea.entity';

/**
 * Representa o registro de um voto de um usuário em uma ideia.
 */
@Entity({ name: 'votes' })
@Unique(['user', 'idea'])
export class Vote {
  @ApiProperty({
    description: 'Identificador único do voto (UUID)',
    example: 'c1a2b3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Usuário que efetuou o voto.
   * Removido da resposta JSON para não expor dados sensíveis.
   */
  @Exclude()
  @ManyToOne(() => User, (user) => user.votes, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Ideia que recebeu o voto.
   * Removido da resposta JSON para evitar payload pesado.
   */
  @Exclude()
  @ManyToOne(() => Idea, (idea) => idea.votesRelation, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idea_id' })
  idea: Idea;
}
