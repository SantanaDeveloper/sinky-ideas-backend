import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { IdeasService } from './ideas.service';
import { Idea } from './entities/idea.entity';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { IdeaReportDto } from './dto/idea-report.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('ideas')
@Controller('ideas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  /**
   * Lista todas as ideias cadastradas.
   *
   * Rota pública: não requer autenticação.
   *
   * @returns Promise com array de entidades Idea.
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Lista todas as ideias' })
  @ApiResponse({ status: 200, type: [Idea] })
  list(): Promise<Idea[]> {
    return this.ideasService.findAll();
  }

  /**
   * Cria uma nova ideia.
   *
   * Requer usuário autenticado (JWT). Usa CreateIdeaDto para validação.
   *
   * @param dto Dados da ideia (título).
   * @param user Usuário autenticado (criador).
   * @returns Promise com a entidade Idea criada.
   */
  @Post()
  @ApiOperation({ summary: 'Cria uma nova ideia (usuário autenticado)' })
  @ApiResponse({ status: 201, type: Idea })
  create(
    @Body() dto: CreateIdeaDto,
    @GetUser() user: User,
  ): Promise<Idea> {
    return this.ideasService.create(dto, user);
  }

  /**
   * Registra um voto em uma ideia (1 voto por usuário).
   *
   * Requer usuário autenticado. Valida UUID do path param.
   *
   * @param id UUID da ideia.
   * @param user Usuário que está votando.
   * @returns Promise com a entidade Idea atualizada.
   */
  @Post(':id/vote')
  @HttpCode(200)
  @ApiOperation({ summary: 'Vota na ideia (1 voto por usuário)' })
  @ApiResponse({ status: 200, type: Idea })
  @ApiResponse({ status: 409, description: 'Já votou nesta ideia' })
  vote(
    @Param('id', new ParseUUIDPipe()) id: string,
    @GetUser() user: User,
  ): Promise<Idea> {
    return this.ideasService.vote(id, user);
  }

  /**
   * Gera relatório de uma ideia: criador, total de votos e lista de votantes.
   *
   * Requer usuário autenticado. Valida UUID do path param.
   *
   * @param id UUID da ideia.
   * @returns Promise com IdeaReportDto.
   */
  @Get(':id/report')
  @ApiOperation({ summary: 'Relatório da ideia: criador, votos e votantes' })
  @ApiResponse({ status: 200, type: IdeaReportDto })
  @ApiResponse({ status: 404, description: 'Ideia não encontrada' })
  getReport(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<IdeaReportDto> {
    return this.ideasService.getReport(id);
  }

  /**
   * Atualiza o título de uma ideia.
   *
   * Somente o criador pode executar. Requer usuário autenticado.
   *
   * @param id UUID da ideia.
   * @param dto DTO contendo o novo título.
   * @param user Usuário autenticado que solicita a atualização.
   * @returns Promise com a entidade Idea atualizada.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza o título da ideia (só criador)' })
  @ApiResponse({ status: 200, type: Idea })
  @ApiResponse({ status: 403, description: 'Somente o criador pode alterar' })
  @ApiResponse({ status: 404, description: 'Ideia não encontrada' })
  updateTitle(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: { newTitle: string },
    @GetUser() user: User,
  ): Promise<Idea> {
    return this.ideasService.updateTitle(id, dto.newTitle, user);
  }

  /**
   * Exclui uma ideia do sistema.
   *
   * Somente o criador ou usuário com role 'admin' podem executar.
   *
   * @param id UUID da ideia.
   * @param user Usuário autenticado que solicita a exclusão.
   * @returns Promise<void> (HTTP 204 No Content).
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Exclui uma ideia (criador ou admin)' })
  @ApiNoContentResponse({ description: 'Ideia excluída com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para excluir' })
  @ApiResponse({ status: 404, description: 'Ideia não encontrada' })
  delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.ideasService.delete(id, user);
  }
}
