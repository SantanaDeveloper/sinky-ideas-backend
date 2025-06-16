import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

import { Vote } from '../../ideas/entities/vote.entity';
import { Idea } from '../../ideas/entities/idea.entity';

/**
 * Papéis possíveis de um usuário.
 */
export type UserRole = 'admin' | 'user';

/**
 * Entidade que representa um usuário do sistema.
 */
@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    description: 'Identificador único do usuário (UUID)',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome de usuário único',
    example: 'john_doe',
  })
  @Column({ type: 'varchar', unique: true, length: 50 })
  username: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @ApiProperty({
    description: 'Papel do usuário no sistema',
    enum: ['admin', 'user'],
    example: 'user',
  })
  @Column({ type: 'varchar', default: 'user' })
  role: UserRole;

  /**
   * Relação com votos feitos pelo usuário.
   * Não exposto na serialização JSON.
   */
  @Exclude()
  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  /**
   * Relação com ideias criadas pelo usuário.
   * Não exposto na serialização JSON.
   */
  @Exclude()
  @OneToMany(() => Idea, (idea) => idea.creator)
  ideas: Idea[];
}
