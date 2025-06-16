import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';

/**
 * SeedService
 *
 * Serviço que executa uma semente de dados assim que a aplicação sobe,
 * garantindo que exista um usuário administrador padrão.
 *
 * Executa a lógica no hook `onApplicationBootstrap` do NestJS.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Hook chamado após todos os módulos serem inicializados.
   * Verifica se já existe um usuário com username 'admin'; caso não,
   * cria um novo usuário com role 'admin' e senha default.
   */
  async onApplicationBootstrap(): Promise<void> {
    const adminUser = await this.usersService.findByUsername('admin');
    if (!adminUser) {
      await this.usersService.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin',
      });
      console.log('🛠️  Usuário admin seed criado: admin / admin123');
    }
  }
}
