import { SetMetadata } from '@nestjs/common';

/**
 * Chave usada no metadata para armazenar as roles
 */
export const ROLES_KEY = 'roles' as const;

/**
 * Decorator que marca quais roles têm acesso ao handler ou controller.
 *
 * @param roles Uma lista de strings representando os papéis permitidos (ex.: 'admin', 'user')
 *
 * Exemplo de uso:
 * ```ts
 * @Roles('admin')
 * @Post('protected')
 * protectedRoute() { ... }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
