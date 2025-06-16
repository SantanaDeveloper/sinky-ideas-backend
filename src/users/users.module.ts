import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { User } from './entities/user.entity';
import { Vote } from '../ideas/entities/vote.entity';

/**
 * Módulo responsável pelo gerenciamento de usuários:
 * - Registra as entidades User e Vote no TypeORM
 * - Fornece o UsersService para CRUD de usuários
 * - Expõe endpoints de usuário via UsersController
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vote]),
  ],
  controllers: [
    UsersController,
  ],
  providers: [
    UsersService,
  ],
  exports: [
    UsersService,
  ],
})
export class UsersModule {}
