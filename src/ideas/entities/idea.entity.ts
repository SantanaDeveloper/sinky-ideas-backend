import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { User } from '../../users/entities/user.entity';
import { Vote } from './vote.entity';

/**
 * Representa uma ideia que pode receber votos dos usuários.
 */
@Entity({ name: 'ideas' })
export class Idea {
  @ApiProperty({
    description: 'Identificador único da ideia (UUID)',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Título descritivo da ideia',
    example: 'Adicionar modo escuro ao aplicativo',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Contagem total de votos acumulados',
    example: 42,
  })
  @Column({ type: 'int', default: 0 })
  votes: number;

  /**
   * Usuário que criou esta ideia.
   */
  @ApiProperty({
    description: 'Usuário que criou esta ideia',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.ideas, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  /**
   * Relação interna de votos (não exposta na API).
   */
  @Exclude()
  @OneToMany(() => Vote, (vote) => vote.idea, {
    cascade: ['insert'],
  })
  votesRelation: Vote[];
}
