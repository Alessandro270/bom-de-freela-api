import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  UpdateNameDto,
  UpdateEmailDto,
  UpdatePasswordDto,
} from './dto/update-user.dto.js';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Dados da conta',
    description:
      'Retorna os dados do utilizador autenticado, incluindo perfis de cliente e freelancer.',
  })
  @ApiResponse({ status: 200, description: 'Dados do utilizador' })
  async getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Atualizar nome',
    description: 'Atualiza o nome do utilizador autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Nome atualizado com sucesso' })
  async updateName(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateNameDto,
  ) {
    return this.usersService.updateName(userId, dto);
  }

  @Patch('me/email')
  @ApiOperation({
    summary: 'Alterar email',
    description: 'Altera o email do utilizador (requer confirmação de senha).',
  })
  @ApiResponse({ status: 200, description: 'Email atualizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Senha incorreta' })
  @ApiResponse({ status: 409, description: 'Email já em uso' })
  async updateEmail(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateEmailDto,
  ) {
    return this.usersService.updateEmail(userId, dto);
  }

  @Patch('me/password')
  @ApiOperation({
    summary: 'Alterar senha',
    description: 'Altera a senha do utilizador (requer senha atual).',
  })
  @ApiResponse({ status: 200, description: 'Senha atualizada com sucesso' })
  @ApiResponse({ status: 401, description: 'Senha atual incorreta' })
  async updatePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(userId, dto);
  }
}
