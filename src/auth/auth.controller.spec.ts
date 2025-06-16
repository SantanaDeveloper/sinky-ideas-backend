import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SignupDto } from '../users/dto/signup.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;
  let usersService: Partial<UsersService>;

  const mockUserEntity = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    username: 'alice',
    password: 'hashed-pass',
    role: 'user' as const,
  };

  beforeEach(async () => {
    authService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };
    usersService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signup', () => {
    it('should call usersService.create with CreateUserDto and return user without password', async () => {
      const dto: SignupDto = { username: 'bob', password: 'secret123' };
      (usersService.create as jest.Mock).mockResolvedValue(mockUserEntity);

      const result = await controller.signup(dto);

      // Verifica que mapearam corretamente
      expect(usersService.create).toHaveBeenCalledWith({
        username: dto.username,
        password: dto.password,
      } as CreateUserDto);

      // O resultado deve omitir a senha
      expect(result).toEqual({
        id: mockUserEntity.id,
        username: mockUserEntity.username,
        role: mockUserEntity.role,
      });
    });
  });

  describe('login', () => {
    const dto: SignupDto = { username: 'alice', password: 'pass1' };
    const validatedUser = { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', username: 'alice', role: 'user' as const };
    const jwtResult = { access_token: 'jwt-token' };

    it('should validate user then return JWT', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue(validatedUser);
      (authService.login as jest.Mock).mockResolvedValue(jwtResult);

      const result = await controller.login(dto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        dto.username,
        dto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(validatedUser);
      expect(result).toBe(jwtResult);
    });
  });
});
