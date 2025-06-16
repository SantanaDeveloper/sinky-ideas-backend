import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdeasModule } from './ideas.module';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';
import { Idea } from './entities/idea.entity';
import { Vote } from './entities/vote.entity';

describe('IdeasModule', () => {
  let module: TestingModule;
  let service: IdeasService;
  let controller: IdeasController;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [IdeasModule],
    })
      // mock the TypeORM repositories that IdeasModule.forFeature provides
      .overrideProvider(getRepositoryToken(Idea))
      .useValue({} as Repository<Idea>)
      .overrideProvider(getRepositoryToken(Vote))
      .useValue({} as Repository<Vote>)
      .compile();

    service = module.get<IdeasService>(IdeasService);
    controller = module.get<IdeasController>(IdeasController);
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide IdeasService', () => {
    expect(service).toBeInstanceOf(IdeasService);
  });

  it('should provide IdeasController', () => {
    expect(controller).toBeInstanceOf(IdeasController);
  });
});