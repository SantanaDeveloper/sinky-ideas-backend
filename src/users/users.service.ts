import { ForbiddenException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from './entities/user.entity';
import { Vote } from '../ideas/entities/vote.entity';
import { UserDto } from './dto/user.dto';
import { Idea } from '../ideas/entities/idea.entity';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * Serviço responsável pelo CRUD de usuários e obtenção das ideias votadas.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,

    @InjectRepository(Vote)
    private readonly votesRepo: Repository<Vote>,
  ) { }

  /**
   * Retorna todos os usuários, omitindo dados sensíveis.
   *
   * @returns Array de usuários com id, username e role.
   */
  async findAll(): Promise<User[]> {
    return this.repo.find({
      select: ['id', 'username', 'role'],
    });
  }

  /**
   * Busca um usuário pelo username.
   *
   * @param username - Nome de usuário para pesquisa.
   * @returns A entidade User ou null se não encontrado.
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOneBy({ username });
  }

  /**
   * Cria um novo usuário, aplicando hash na senha e atribuindo role.
   *
   * @param dto - Dados do usuário (username, password, optional role).
   * @returns A entidade User criada.
   */
  async create(dto: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(dto.password!, 10);
    const user = this.repo.create({
      username: dto.username,
      password: hash,
      role: dto.role ?? 'user',
    });
    return this.repo.save(user);
  }

  /**
   * Atualiza a role de um usuário específico.
   *
   * @param targetUserId - ID do usuário alvo.
   * @param newRole - Nova role a ser atribuída.
   * @param currentUserId - ID do usuário que está requisitando a alteração.
   * @throws ForbiddenException se tentar alterar a própria role.
   */
  async updateRole(
    targetUserId: string,
    newRole: UserRole,
    currentUserId: string,
  ): Promise<void> {
    if (targetUserId === currentUserId) {
      throw new ForbiddenException(
        'Você não pode alterar sua própria role',
      );
    }
    await this.repo.update(targetUserId, { role: newRole });
  }

  /**
   * Retorna as ideias que um usuário votou.
   *
   * @param userId - ID do usuário.
   * @returns Array de entidades Idea votadas por ele.
   */
  async findVotedIdeas(userId: string): Promise<Idea[]> {
    const votes = await this.votesRepo.find({
      where: { user: { id: userId } },
      relations: ['idea'],
    });
    return votes.map((v) => v.idea);
  }

  /**
 * Retorna apenas os IDs das ideias que um usuário votou.
 *
 * @param userId - ID do usuário.
 * @returns Array de IDs de ideias.
 */
  async getVotedIdeaIds(userId: string): Promise<string[]> {
    const votes = await this.votesRepo.find({
      where: { user: { id: userId } },
      relations: ['idea'],
      select: ['idea'], // limita para buscar só a relação
    });

    return votes.map(vote => vote.idea.id);
  }
}
