import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ForbiddenException } from '@nestjs/common';

import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { Vote } from '../ideas/entities/vote.entity';
import { Idea } from '../ideas/entities/idea.entity';
import { CreateUserDto } from './dto/create-user.dto';

type MockRepo<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;


describe('UsersService', () => {
  let service: UsersService;
  let userRepo: MockRepo<User>;
  let voteRepo: MockRepo<Vote>;

  const aliceId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const bobId = '4fa85f64-5717-4562-b3fc-2c963f66afb7';

  const alice: User = {
    id: aliceId,
    username: 'alice',
    password: 'hashed',
    role: 'user',
    votes: [],
    ideas: [],
  };

  const vote1: Vote = {
    id: '5fa85f64-5717-4562-b3fc-2c963f66afc8',
    user: alice,
    idea: { id: 'i1', title: 'Idea1', votes: 0, creator: alice, votesRelation: [] } as Idea,
  };

  beforeEach(async () => {
    userRepo = {
      find: jest.fn().mockResolvedValue([alice]),
      findOneBy: jest.fn().mockResolvedValue(alice),
      create: jest.fn().mockImplementation(dto => ({ ...dto })),
      save: jest.fn().mockResolvedValue(alice),
      update: jest.fn().mockResolvedValue(undefined),
    };
    voteRepo = {
      find: jest.fn().mockResolvedValue([vote1]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Vote), useValue: voteRepo },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findAll', () => {
    it('should return all users without sensitive fields', async () => {
      const result = await service.findAll();
      expect(userRepo.find).toHaveBeenCalledWith({ select: ['id', 'username', 'role'] });
      expect(result).toEqual([alice]);
    });
  });

  describe('findByUsername', () => {
    it('should return a user when found', async () => {
      const username = 'alice';
      const result = await service.findByUsername(username);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ username });
      expect(result).toBe(alice);
    });
  });

  describe('create', () => {
    it('should hash password and save new user', async () => {
      const dto: CreateUserDto = {
        username: 'bob',
        password: 'secret',
        role: 'admin' as UserRole,
      };

      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPass' as never);

      userRepo.create!.mockReturnValue({
        username: dto.username,
        password: 'hashedPass',
        role: 'admin',
      } as User);

      const result = await service.create(dto);

      expect(hashSpy).toHaveBeenCalledWith('secret', 10);
      expect(userRepo.create).toHaveBeenCalledWith({
        username: dto.username,
        password: 'hashedPass',
        role: 'admin',
      });
      expect(userRepo.save).toHaveBeenCalledWith({
        username: dto.username,
        password: 'hashedPass',
        role: 'admin',
      });
      expect(result).toBe(alice);
    });

  });

  it('should assign default role "user" when role is not provided', async () => {
    const dto: CreateUserDto = {
      username: 'bob',
      password: 'secret',
      // role is undefined
    };

    const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPass' as never);

    userRepo.create!.mockReturnValue({
      username: dto.username,
      password: 'hashedPass',
      role: 'user',
    } as User);

    const result = await service.create(dto);

    expect(hashSpy).toHaveBeenCalledWith('secret', 10);
    expect(userRepo.create).toHaveBeenCalledWith({
      username: dto.username,
      password: 'hashedPass',
      role: 'user', // 👈 Aqui é onde cobrimos a branch
    });
    expect(userRepo.save).toHaveBeenCalledWith({
      username: dto.username,
      password: 'hashedPass',
      role: 'user',
    });
    expect(result).toBe(alice); // Mockado para sempre retornar 'alice'
  });

  describe('updateRole', () => {
    it('should throw if targetUserId equals currentUserId', async () => {
      await expect(service.updateRole(aliceId, 'admin', aliceId)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should update role when different users', async () => {
      const newRole: UserRole = 'admin';
      await service.updateRole(aliceId, newRole, bobId);
      expect(userRepo.update).toHaveBeenCalledWith(aliceId, { role: newRole });
    });
  });

  describe('findVotedIdeas', () => {
    it('should return array of ideas voted by user', async () => {
      const result = await service.findVotedIdeas(aliceId);
      expect(voteRepo.find).toHaveBeenCalledWith({
        where: { user: { id: aliceId } },
        relations: ['idea'],
      });
      expect(result).toEqual([vote1.idea]);
    });
  });

  describe('getVotedIdeaIds', () => {
    it('should return apenas os IDs das ideias que o usuário votou', async () => {
      const vote1: Vote = {
        id: '5fa85f64-5717-4562-b3fc-2c963f66afc8',
        user: alice,
        idea: { id: 'i1', title: 'Idea1', votes: 0, creator: alice, votesRelation: [] } as Idea,
      };
      voteRepo.find!.mockResolvedValue([vote1]);

      const result = await service.getVotedIdeaIds(aliceId);

      expect(voteRepo.find).toHaveBeenCalledWith({
        where: { user: { id: aliceId } },
        relations: ['idea'],
        select: ['idea'],
      });
      expect(result).toEqual(['i1']);
    });
  });
});