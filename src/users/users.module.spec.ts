// src/users/users.module.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Idea } from '../ideas/entities/idea.entity';
import { Vote } from '../ideas/entities/vote.entity';

describe('UsersModule', () => {
  let moduleRef: TestingModule;
  let dataSource: DataSource;

  // Aumenta o timeout para 20s
  jest.setTimeout(20_000);

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        // Conexão in-memory para todos os testes de módulo
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Idea, Vote],
          synchronize: true,
        }),
        UsersModule,
      ],
    }).compile();

    // Recupera o DataSource para encerrar depois
    dataSource = moduleRef.get<DataSource>(DataSource);
  });

  it('deve compilar o módulo', () => {
    expect(moduleRef).toBeDefined();
  });

  it('deve fornecer UsersService', () => {
    const service = moduleRef.get<UsersService>(UsersService);
    expect(service).toBeInstanceOf(UsersService);
  });

  it('deve registrar UsersController', () => {
    const controller = moduleRef.get<UsersController>(UsersController);
    expect(controller).toBeInstanceOf(UsersController);
  });

  afterAll(async () => {
    // fecha a conexão com o banco
    await dataSource.destroy();
  });
});
