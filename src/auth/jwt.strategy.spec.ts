import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy, JwtPayload } from './jwt.strategy';

describe('JwtStrategy', () => {
  let configService: Partial<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    };
  });

  describe('constructor', () => {
    it('should throw BadRequestException if JWT_SECRET not defined', () => {
      (configService.get as jest.Mock).mockReturnValue(undefined);
      expect(() => new JwtStrategy(configService as ConfigService))
        .toThrow(BadRequestException);
    });

    it('should not throw when JWT_SECRET is defined', () => {
      (configService.get as jest.Mock).mockReturnValue('mysecret');
      expect(() => new JwtStrategy(configService as ConfigService))
        .not.toThrow();
    });
  });

  describe('validate()', () => {
    let strategy: JwtStrategy;

    beforeEach(() => {
      (configService.get as jest.Mock).mockReturnValue('mysecret');
      strategy = new JwtStrategy(configService as ConfigService);
    });

    it('should return user object for valid payload', async () => {
      const payload: JwtPayload = { sub: 42, username: 'alice', role: 'user' };
      const result = await strategy.validate(payload);
      expect(result).toEqual({ id: 42, username: 'alice', role: 'user' });
    });

    it('should throw UnauthorizedException if payload.sub is missing', async () => {
      const bad: any = { username: 'alice', role: 'user' };
      await expect(strategy.validate(bad)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException if payload.username is missing', async () => {
      const bad: any = { sub: 42, role: 'user' };
      await expect(strategy.validate(bad)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});