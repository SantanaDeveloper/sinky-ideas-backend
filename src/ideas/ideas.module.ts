import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';

import { Idea } from './entities/idea.entity';
import { Vote } from './entities/vote.entity';

/**
 * Módulo responsável por gerenciar ideias e votos.
 *
 * Importa as entidades Idea e Vote para o TypeORM,
 * fornece o serviço de regras de negócio e expõe o controller
 * com os endpoints REST.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Idea, Vote]),
  ],
  controllers: [
    IdeasController,
  ],
  providers: [
    IdeasService,
  ],
  exports: [
    IdeasService,
  ],
})
export class IdeasModule {}
