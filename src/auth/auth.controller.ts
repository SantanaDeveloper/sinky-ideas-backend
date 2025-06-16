import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignupDto } from '../users/dto/signup.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Public()
  @Post('signup')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Cria um novo usuário (role=user)' })
  @ApiBody({ type: SignupDto })
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso' })
  async signup(@Body() dto: SignupDto) {
    const createDto: CreateUserDto = {
      username: dto.username,
      password: dto.password
    };
    const user = await this.usersService.create(createDto);
    const { password, ...rest } = user;
    return rest;
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Autentica um usuário e retorna JWT' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 200, description: 'Usuário autenticado com sucesso', schema: {
      example: { access_token: 'eyJhbGciOi...' },
    }
  })
  async login(@Body() dto: SignupDto) {
    const validatedUser = await this.authService.validateUser(
      dto.username,
      dto.password,
    );
    return this.authService.login(validatedUser);
  }
}
