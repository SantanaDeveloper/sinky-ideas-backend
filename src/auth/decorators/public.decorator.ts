// src/auth/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Chave usada no metadata para marcar rotas públicas.
 */
export const IS_PUBLIC_KEY = 'isPublic' as const;

/**
 * Decorator que marca um handler ou controller como público,
 * fazendo com que o JwtAuthGuard seja ignorado.
 *
 * Uso:
 *   @Public()
 *   @Get('open')
 *   openEndpoint() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
