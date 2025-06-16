import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const mockSuperCanActivate = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
    reflector = module.get(Reflector);

    const parentProto = Object.getPrototypeOf(JwtAuthGuard.prototype);
    jest
      .spyOn(parentProto as any, 'canActivate')
      .mockImplementation(mockSuperCanActivate);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('canActivate', () => {
    let ctx: ExecutionContext;
    const user = { id: 'u1', username: 'alice' };

    beforeEach(() => {
      ctx = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: () => ({ user }),
        }),
      } as any;
    });

    it('should allow public routes', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(mockSuperCanActivate).not.toHaveBeenCalled();
    });

    it('should return user object when token valid on protected route', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockSuperCanActivate.mockResolvedValue(true);

      await expect(guard.canActivate(ctx)).resolves.toEqual(user);
      expect(mockSuperCanActivate).toHaveBeenCalledWith(ctx);
    });

    it('should return false when super.canActivate returns false', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockSuperCanActivate.mockResolvedValue(false);

      await expect(guard.canActivate(ctx)).resolves.toBe(false);
      expect(mockSuperCanActivate).toHaveBeenCalledWith(ctx);
    });

    it('should throw if super valid but request.user missing', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockSuperCanActivate.mockResolvedValue(true);

      (ctx.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: () => ({}),
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        new UnauthorizedException('Token de autenticação inválido ou ausente'),
      );
    });
  });

  describe('handleRequest', () => {
    const dummyCtx = {} as ExecutionContext;
    const user = { id: 'u2', username: 'bob' };

    it('should rethrow any error passed in', () => {
      const err = new Error('something broke');
      expect(() => guard.handleRequest(err, null, null, dummyCtx)).toThrow(err);
    });

    it('should throw if user is falsy', () => {
      expect(() =>
        guard.handleRequest(null, null, null, dummyCtx),
      ).toThrow(new UnauthorizedException('Token de autenticação inválido ou ausente'));
    });

    it('should return the user when present', () => {
      expect(guard.handleRequest(null, user, null, dummyCtx)).toEqual(user);
    });
  });
});