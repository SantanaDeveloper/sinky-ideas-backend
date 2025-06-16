import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  function createContext(user?: any, rolesMeta?: string[]): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ user }),
      }),
    } as any as ExecutionContext;
  }

  it('should allow access when no roles metadata is defined', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const ctx = createContext({ role: 'admin' });
    expect(guard.canActivate(ctx)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  });

  it('should allow access when roles metadata is empty array', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([]);

    const ctx = createContext({ role: 'user' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw UnauthorizedException when user is not present', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const ctx = createContext(undefined);

    expect(() => guard.canActivate(ctx))
      .toThrow(new UnauthorizedException('Usuário não autenticado para verificar permissões'));
  });

  it('should throw ForbiddenException when user role is not allowed', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin', 'manager']);
    const ctx = createContext({ role: 'user' });

    expect(() => guard.canActivate(ctx))
      .toThrow(new ForbiddenException('Acesso negado: você não tem permissão para acessar este recurso'));
  });

  it('should allow access when user role is allowed', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin', 'manager']);
    const ctx = createContext({ role: 'manager' });
    expect(guard.canActivate(ctx)).toBe(true);
  });
});