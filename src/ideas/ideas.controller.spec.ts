import { Test, TestingModule } from '@nestjs/testing';
import { IdeasController } from './ideas.controller';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { IdeaReportDto } from './dto/idea-report.dto';
import { Idea } from './entities/idea.entity';
import { User } from '../users/entities/user.entity';

describe('IdeasController', () => {
  let controller: IdeasController;
  let service: Partial<IdeasService>;

  const mockUser: User = { id: 'fcaeef22-76ff-40be-9d87-a25fe736f535', username: 'alice', password: '', role: 'user', ideas: [], votes: [] };
  const mockIdea: Idea = { id: 'fcaeef43-76ff-40be-9d87-a25fe736f535', title: 'Test', votes: 0, creator: mockUser, votesRelation: [] };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([mockIdea]),
      create: jest.fn().mockResolvedValue({ ...mockIdea, title: 'Created' }),
      vote: jest.fn().mockResolvedValue({ ...mockIdea, votes: 1 }),
      getReport: jest.fn().mockResolvedValue({
        id: mockIdea.id,
        title: mockIdea.title,
        creator: mockUser.username,
        votesCount: mockIdea.votes,
        voters: [],
      } as IdeaReportDto),
      updateTitle: jest.fn().mockResolvedValue({ ...mockIdea, title: 'Updated' }),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdeasController],
      providers: [{ provide: IdeasService, useValue: service }],
    }).compile();

    controller = module.get(IdeasController);
  });

  it('should list all ideas', async () => {
    const result = await controller.list();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockIdea]);
  });

  it('should create a new idea', async () => {
    const dto: CreateIdeaDto = { title: 'Created' };
    const result = await controller.create(dto, mockUser);
    expect(service.create).toHaveBeenCalledWith(dto, mockUser);
    expect(result.title).toBe('Created');
  });

  it('should vote on an idea', async () => {
    const result = await controller.vote('fcaeef43-76ff-40be-9d87-a25fe736f535', mockUser);
    expect(service.vote).toHaveBeenCalledWith('fcaeef43-76ff-40be-9d87-a25fe736f535', mockUser);
    expect(result.votes).toBe(1);
  });

  it('should get report for an idea', async () => {
    const result = await controller.getReport('fcaeef43-76ff-40be-9d87-a25fe736f535');
    expect(service.getReport).toHaveBeenCalledWith('fcaeef43-76ff-40be-9d87-a25fe736f535');
    expect(result).toMatchObject<Partial<IdeaReportDto>>({
      id: 'fcaeef43-76ff-40be-9d87-a25fe736f535',
      title: 'Test',
      creator: 'alice',
    });
  });

  it('should update the title of an idea', async () => {
    const body = { newTitle: 'Updated' };
    const result = await controller.updateTitle('1', body, mockUser);
    expect(service.updateTitle).toHaveBeenCalledWith('1', 'Updated', mockUser);
    expect(result.title).toBe('Updated');
  });

  it('should delete an idea', async () => {
    await expect(controller.delete('fcaeef43-76ff-40be-9d87-a25fe736f535', mockUser)).resolves.toBeUndefined();
    expect(service.delete).toHaveBeenCalledWith('fcaeef43-76ff-40be-9d87-a25fe736f535', mockUser);
  });
});
