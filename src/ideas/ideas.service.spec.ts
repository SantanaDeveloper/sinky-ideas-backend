import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IdeasService } from './ideas.service';
import { Idea } from './entities/idea.entity';
import { Vote } from './entities/vote.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { CreateIdeaDto } from './dto/create-idea.dto';

type MockRepo<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('IdeasService', () => {
  let service: IdeasService;
  let ideasRepo: MockRepo<Idea>;
  let votesRepo: MockRepo<Vote>;

  const mockUser: User = {
    id: 'fcaeef22-76ff-40be-9d87-a25fe736f535',
    username: 'u',
    password: 'p',
    role: 'user',
    ideas: [],
    votes: [],
  };

  const savedIdea: Idea = {
    id: 'fcaeef43-76ff-40be-9d87-a25fe736f535',
    title: 'foo',
    votes: 0,
    creator: mockUser,
    votesRelation: [],
  };

  beforeEach(async () => {
    ideasRepo = {
      create: jest.fn().mockReturnValue(savedIdea),
      save: jest.fn().mockResolvedValue(savedIdea),
      find: jest.fn().mockResolvedValue([savedIdea]),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    votesRepo = {
      findOne: jest.fn(),
      create: jest.fn(v => v),
      save: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdeasService,
        { provide: getRepositoryToken(Idea), useValue: ideasRepo },
        { provide: getRepositoryToken(Vote), useValue: votesRepo },
      ],
    }).compile();

    service = module.get(IdeasService);
  });

  describe('create', () => {
    it('should create and save a new idea', async () => {
      const dto: CreateIdeaDto = { title: 'foo' };
      const result = await service.create(dto, mockUser);
      expect(ideasRepo.create).toHaveBeenCalledWith({
        title: dto.title,
        votes: 0,
        creator: mockUser,
      });
      expect(ideasRepo.save).toHaveBeenCalledWith(savedIdea);
      expect(result).toBe(savedIdea);
    });
  });

  describe('findAll', () => {
    it('should return array of ideas', async () => {
      const result = await service.findAll();
      expect(ideasRepo.find).toHaveBeenCalled();
      expect(result).toEqual([savedIdea]);
    });
  });

  describe('getReport', () => {
    it('should return report when idea exists', async () => {
      (ideasRepo.findOne as jest.Mock).mockResolvedValue({
        ...savedIdea,
        votesRelation: [{ user: mockUser }],
      });
      const report = await service.getReport('fcaeef43-76ff-40be-9d87-a25fe736f535');
      expect(ideasRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'fcaeef43-76ff-40be-9d87-a25fe736f535' },
        relations: ['creator', 'votesRelation', 'votesRelation.user'],
      });
      expect(report).toEqual({
        id: 'fcaeef43-76ff-40be-9d87-a25fe736f535',
        title: 'foo',
        creator: 'u',
        votesCount: 0,
        voters: ['u'],
      });
    });

    it('should throw NotFoundException when idea not found', async () => {
      (ideasRepo.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(service.getReport('fcaeef43-76ff-40be-9d87-a25fe736f535')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateTitle', () => {
    it('should update title if user is creator', async () => {
      (ideasRepo.findOne as jest.Mock).mockResolvedValue({
        ...savedIdea,
        creator: mockUser,
      });

      const updatedIdea = { ...savedIdea, title: 'new' };
      (ideasRepo.save as jest.Mock).mockResolvedValue(updatedIdea);

      const result = await service.updateTitle('fcaeef43-76ff-40be-9d87-a25fe736f535', 'new', mockUser);

      expect(ideasRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        title: 'new',
      }));
      expect(result.title).toBe('new');
    });

    it('should throw ForbiddenException if not creator', async () => {
      (ideasRepo.findOne as jest.Mock).mockResolvedValue({
        ...savedIdea,
        creator: { ...mockUser, id: 2 },
      });
      await expect(
        service.updateTitle('1', 'new', mockUser),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw NotFoundException if idea not found', async () => {
      (ideasRepo.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(
        service.updateTitle('fcaeef43-76ff-40be-9d87-a25fe736f535', 'new', mockUser),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('vote', () => {
    it('should register vote and increment count', async () => {
      (ideasRepo.findOneBy as jest.Mock).mockResolvedValue(savedIdea);
      (votesRepo.findOne as jest.Mock).mockResolvedValue(undefined);

      const result = await service.vote('fcaeef43-76ff-40be-9d87-a25fe736f535', mockUser);
      expect(votesRepo.create).toHaveBeenCalledWith({ idea: savedIdea, user: mockUser });
      expect(votesRepo.save).toHaveBeenCalled();
      expect(ideasRepo.save).toHaveBeenCalledWith(expect.objectContaining({ votes: 1 }));
      expect(result.votes).toBe(1);
    });

    it('should throw ConflictException if already voted', async () => {
      (ideasRepo.findOneBy as jest.Mock).mockResolvedValue(savedIdea);
      (votesRepo.findOne as jest.Mock).mockResolvedValue({});

      await expect(service.vote('fcaeef43-76ff-40be-9d87-a25fe736f535', mockUser)).rejects.toBeInstanceOf(ConflictException);
    });

    it('should throw NotFoundException if idea not found', async () => {
      (ideasRepo.findOneBy as jest.Mock).mockResolvedValue(undefined);
      await expect(service.vote('1', mockUser)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete if creator', async () => {
      (ideasRepo.findOne as jest.Mock).mockResolvedValue({
        ...savedIdea,
        creator: mockUser,
      });
      await expect(service.delete('fcaeef43-76ff-40be-9d87-a25fe736f535', mockUser)).resolves.toBeUndefined();
      expect(ideasRepo.delete).toHaveBeenCalledWith('fcaeef43-76ff-40be-9d87-a25fe736f535');
    });

    it('should delete if admin', async () => {
      (ideasRepo.findOne as jest.Mock).mockResolvedValue({
        ...savedIdea,
        creator: { ...mockUser, id: 2 },
      });
      const admin = { ...mockUser, role: 'admin' as const };
      await expect(service.delete('fcaeef43-76ff-40be-9d87-a25fe736f535', admin)).resolves.toBeUndefined();
      expect(ideasRepo.delete).toHaveBeenCalledWith('fcaeef43-76ff-40be-9d87-a25fe736f535');
    });

    it('should throw ForbiddenException if not creator or admin', async () => {
      (ideasRepo.findOne as jest.Mock).mockResolvedValue({
        ...savedIdea,
        creator: { ...mockUser, id: '2' },
      });
      await expect(service.delete('fcaeef43-76ff-40be-9d87-a25fe736f535', mockUser)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw NotFoundException if idea not found', async () => {
      (ideasRepo.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(service.delete('fcaeef43-76ff-40be-9d87-a25fe736f535', mockUser)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
