import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Idea } from './entities/idea.entity';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { IdeaReportDto } from './dto/idea-report.dto';
import { Vote } from './entities/vote.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class IdeasService {
  constructor(
    @InjectRepository(Idea)
    private readonly ideasRepo: Repository<Idea>,

    @InjectRepository(Vote)
    private readonly votesRepo: Repository<Vote>,
  ) {}

  /**
   * Cria uma nova ideia associada a um usuário criador.
   *
   * @param dto - Dados para criação da ideia (título).
   * @param creator - Usuário que está criando a ideia.
   * @returns A entidade Idea recém-criada.
   */
  async create(dto: CreateIdeaDto, creator: User): Promise<Idea> {
    const idea = this.ideasRepo.create({
      title: dto.title,
      votes: 0,
      creator,
    });
    return this.ideasRepo.save(idea);
  }

  /**
   * Retorna todas as ideias cadastradas.
   *
   * @returns Array de entidades Idea.
   */
  findAll(): Promise<Idea[]> {
    return this.ideasRepo.find();
  }

  /**
   * Gera um relatório detalhado de uma ideia, incluindo criador,
   * total de votos e lista de usernames de quem votou.
   *
   * @param id - UUID da ideia.
   * @throws NotFoundException se não encontrar a ideia.
   * @returns Um objeto IdeaReportDto com os detalhes.
   */
  async getReport(id: string): Promise<IdeaReportDto> {
    const idea = await this.ideasRepo.findOne({
      where: { id },
      relations: ['creator', 'votesRelation', 'votesRelation.user'],
    });
    if (!idea) {
      throw new NotFoundException(`Ideia #${id} não encontrada`);
    }

    return {
      id: idea.id,
      title: idea.title,
      creator: idea.creator.username,
      votesCount: idea.votes,
      voters: idea.votesRelation.map(v => v.user.username),
    };
  }

  /**
   * Atualiza o título de uma ideia. Somente o criador pode executar.
   *
   * @param id - UUID da ideia.
   * @param newTitle - Novo título para a ideia.
   * @param user - Usuário que solicita a atualização.
   * @throws NotFoundException se a ideia não existir.
   * @throws ForbiddenException se o usuário não for o criador.
   * @returns A entidade Idea atualizada.
   */
  async updateTitle(
    id: string,
    newTitle: string,
    user: User,
  ): Promise<Idea> {
    const idea = await this.loadWithCreator(id);
    if (idea.creator.id !== user.id) {
      throw new ForbiddenException(
        'Apenas o criador pode atualizar o título desta ideia',
      );
    }
    idea.title = newTitle;
    return this.ideasRepo.save(idea);
  }

  /**
   * Registra um voto em uma ideia (1 voto por usuário) e incrementa o contador.
   *
   * @param ideaId - UUID da ideia.
   * @param user - Usuário que está votando.
   * @throws NotFoundException se a ideia não existir.
   * @throws ConflictException se o usuário já tiver votado.
   * @returns A entidade Idea com o novo total de votos.
   */
  async vote(ideaId: string, user: User): Promise<Idea> {
    const idea = await this.loadBasic(ideaId);

    const alreadyVoted = await this.votesRepo.findOne({
      where: { idea: { id: ideaId }, user: { id: user.id } },
    });
    if (alreadyVoted) {
      throw new ConflictException('Você já votou nessa ideia');
    }

    await this.votesRepo.save(this.votesRepo.create({ idea, user }));
    idea.votes += 1;
    return this.ideasRepo.save(idea);
  }

  /**
   * Exclui uma ideia. Apenas o criador ou um usuário admin pode executar.
   *
   * @param id - UUID da ideia.
   * @param user - Usuário que solicita a exclusão.
   * @throws NotFoundException se a ideia não existir.
   * @throws ForbiddenException se o usuário não for o criador nem admin.
   */
  async delete(id: string, user: User): Promise<void> {
    const idea = await this.loadWithCreator(id);

    const isCreator = idea.creator.id === user.id;
    const isAdmin = user.role === 'admin';
    if (!isCreator && !isAdmin) {
      throw new ForbiddenException(
        'Apenas o criador ou um administrador podem excluir esta ideia',
      );
    }

    await this.ideasRepo.delete(id);
  }

  /**
   * Carrega somente os campos básicos de uma ideia.
   *
   * @param id - UUID da ideia.
   * @throws NotFoundException se não encontrar a ideia.
   * @returns A entidade Idea encontrada.
   */
  private async loadBasic(id: string): Promise<Idea> {
    const idea = await this.ideasRepo.findOneBy({ id });
    if (!idea) {
      throw new NotFoundException(`Ideia #${id} não encontrada`);
    }
    return idea;
  }

  /**
   * Carrega a ideia junto com a relação de criador.
   *
   * @param id - UUID da ideia.
   * @throws NotFoundException se não encontrar a ideia.
   * @returns A entidade Idea com o criador carregado.
   */
  private async loadWithCreator(id: string): Promise<Idea> {
    const idea = await this.ideasRepo.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!idea) {
      throw new NotFoundException(`Ideia #${id} não encontrada`);
    }
    return idea;
  }
}
