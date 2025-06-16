
import { ExecutionContext } from '@nestjs/common';
import { getUserFromRequest } from './get-user.decorator';
import { User } from '../../users/entities/user.entity';

describe('getUserFromRequest', () => {
  const mockUser: User = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    username: 'john@example.com',
    password: 'securehash123',
    ideas: [],
    role: 'user',
    votes: [],
  };

  const createMockContext = (): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({ user: mockUser }),
    }),
  } as unknown as ExecutionContext);

  it('deve retornar o objeto completo do usuário quando data for undefined', () => {
    const ctx = createMockContext();
    const result = getUserFromRequest(undefined, ctx);
    expect(result).toEqual(mockUser);
  });

  it('deve retornar uma propriedade específica do usuário quando data for fornecido', () => {
    const ctx = createMockContext();
    const result = getUserFromRequest('username', ctx);
    expect(result).toBe(mockUser.username);
  });

  it('deve retornar undefined se a propriedade solicitada não existir', () => {
    const ctx = createMockContext();
    const result = getUserFromRequest('nonExistentProperty' as keyof User, ctx);
    expect(result).toBeUndefined();
  });
});