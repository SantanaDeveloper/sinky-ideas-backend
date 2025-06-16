import { Test } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { UsersService } from '../users/users.service';

describe('SeedService', () => {
  let seed: SeedService;
  let users: Partial<UsersService>;

  beforeEach(async () => {
    users = {
      findByUsername: jest.fn(),
      create: jest.fn(),
    };
    const mod = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: UsersService, useValue: users },
      ],
    }).compile();
    seed = mod.get(SeedService);
  });

  it('does not create admin if already exists', async () => {
    (users.findByUsername as jest.Mock).mockResolvedValue({ id: 'x' });
    await seed.onApplicationBootstrap();
    expect(users.create).not.toHaveBeenCalled();
  });

  it('creates admin if missing', async () => {
    (users.findByUsername as jest.Mock).mockResolvedValue(null);
    await seed.onApplicationBootstrap();
    expect(users.create).toHaveBeenCalledWith({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
    });
  });
});
