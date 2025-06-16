import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, JwtPayload } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    id: '23fa85f64-5717-4562-b3fc-2c963f66afa6',
    username: 'john',
    password: '$2b$10$hashedpassword',
    role: 'user',
  };

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
      getVotedIdeaIds : jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user data without password when credentials are valid', async () => {
      (usersService.findByUsername as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      const result = await service.validateUser(
        mockUser.username,
        'plaintext-password',
      );

      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findByUsername as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.validateUser('unknown', 'any'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      (usersService.findByUsername as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      await expect(
        service.validateUser(mockUser.username, 'wrong-password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return an access_token signed by JwtService', async () => {
      const userPayload = { username: 'john', id: '23fa85f64-5717-4562-b3fc-2c963f66afa6', role: 'user' };
      const result = await service.login(userPayload);
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: userPayload.username,
        sub: userPayload.id,
        role: userPayload.role,
      });
      expect(result).toEqual({ access_token: 'signed-jwt-token' });
    });
  });
});
