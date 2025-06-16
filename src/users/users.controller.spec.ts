import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from './entities/user.entity';
import { Idea } from '../ideas/entities/idea.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: Partial<UsersService>;

  // Exemplos de UUIDs válidos
  const aliceId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const bobId   = '4fa85f64-5717-4562-b3fc-2c963f66afb7';
  const ideaId  = '5fa85f64-5717-4562-b3fc-2c963f66afc8';

  const mockUser1: User = {
    id: aliceId,
    username: 'alice',
    password: '',
    role: 'user',
    ideas: [],
    votes: [],
  };
  const mockUser2: User = {
    id: bobId,
    username: 'bob',
    password: '',
    role: 'admin',
    ideas: [],
    votes: [],
  };

  const mockIdea: Idea = {
    id: ideaId,
    title: 'Test Idea',
    votes: 1,
    creator: mockUser1,
    votesRelation: [],
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([mockUser1, mockUser2]),
      updateRole: jest.fn().mockResolvedValue(undefined),
      findVotedIdeas: jest.fn().mockResolvedValue([mockIdea]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get(UsersController);
  });

  it('should list all users without sensitive data', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([
      { id: aliceId, username: 'alice', role: 'user' },
      { id: bobId,   username: 'bob',   role: 'admin' },
    ]);
  });

  it('should update role of another user', async () => {
    const dto: UpdateRoleDto = { role: 'admin' };
    const currentUser = mockUser2;
    const targetId = aliceId;
    const res = await controller.updateRole(targetId, dto, currentUser);
    expect(service.updateRole).toHaveBeenCalledWith(targetId, 'admin', currentUser.id);
    expect(res).toEqual({ message: `Usuário ${targetId} agora é admin` });
  });

  it('should list authenticated user voted ideas', async () => {
    const currentUser = mockUser1;
    const result = await controller.getMyVotedIdeas(currentUser);
    expect(service.findVotedIdeas).toHaveBeenCalledWith(currentUser.id);
    expect(result).toEqual([mockIdea]);
  });
});