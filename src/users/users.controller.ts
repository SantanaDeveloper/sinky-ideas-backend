import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserDto } from './dto/user.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Idea } from '../ideas/entities/idea.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Lista todos os usuários do sistema (exceto campos sensíveis).
   *
   * Permissão: somente usuários com role 'admin'.
   *
   * @returns Array de UserDto contendo id, username e role de cada usuário.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista usuários (admin apenas)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários sem dados sensíveis',
    type: [UserDto],
  })
  async findAll(): Promise<UserDto[]> {
    const users = await this.usersService.findAll();
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
    }));
  }

  /**
   * Atualiza a role de um usuário específico.
   *
   * Permissão: somente 'admin' pode alterar a role de outros usuários.
   * O admin não pode alterar sua própria role através deste endpoint.
   *
   * @param targetUserId - ID do usuário alvo (UUID).
   * @param body - DTO contendo a nova role.
   * @param currentUser - Usuário autenticado que faz a requisição.
   * @returns Mensagem de confirmação.
   */
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Altera a role de outro usuário (admin)' })
  @ApiResponse({ status: 200, description: 'Role atualizada com sucesso' })
  @ApiResponse({ status: 403, description: 'Não pode alterar sua própria role' })
  async updateRole(
    @Param('id', ParseIntPipe) targetUserId: string,
    @Body() { role }: UpdateRoleDto,
    @GetUser() currentUser: User,
  ): Promise<{ message: string }> {
    await this.usersService.updateRole(
      targetUserId,
      role,
      currentUser.id,
    );
    return {
      message: `Usuário ${targetUserId} agora é ${role}`,
    };
  }

  /**
   * Lista todas as ideias em que o usuário autenticado votou.
   *
   * Permissão: usuário autenticado.
   *
   * @param user - Usuário atual (injetado via @GetUser).
   * @returns Array de entidades Idea nas quais o usuário votou.
   */
  @Get('me/votes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista ideias que o usuário autenticado votou' })
  @ApiResponse({ status: 200, type: [Idea] })
  async getMyVotedIdeas(
    @GetUser() user: { id: string },
  ): Promise<Idea[]> {
    return this.usersService.findVotedIdeas(user.id);
  }
}
