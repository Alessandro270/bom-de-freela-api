import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  CreateClientProfileDto,
  UpdateClientProfileDto,
  CreateFreelancerProfileDto,
  UpdateFreelancerProfileDto,
} from './dto/profile.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // ─── Client Profile ──────────────────────────────────────

  @Post('client')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Criar perfil de cliente',
    description: 'Cria um perfil de cliente para o utilizador autenticado.',
  })
  @ApiResponse({ status: 201, description: 'Perfil de cliente criado' })
  @ApiResponse({ status: 409, description: 'Já possui perfil de cliente' })
  async createClientProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateClientProfileDto,
  ) {
    return this.profilesService.createClientProfile(userId, dto);
  }

  @Get('client/:id')
  @ApiOperation({
    summary: 'Ver perfil de cliente',
    description: 'Retorna os dados de um perfil de cliente pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Perfil de cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async getClientProfile(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.profilesService.getClientProfile(id);
  }

  @Patch('client')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Atualizar perfil de cliente',
    description: 'Atualiza o perfil de cliente do utilizador autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado' })
  async updateClientProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateClientProfileDto,
  ) {
    return this.profilesService.updateClientProfile(userId, dto);
  }

  // ─── Freelancer Profile ───────────────────────────────────

  @Post('freelancer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Criar perfil de freelancer',
    description: 'Cria um perfil de freelancer. Requer NIF e telefone.',
  })
  @ApiResponse({ status: 201, description: 'Perfil de freelancer criado' })
  @ApiResponse({ status: 409, description: 'Já possui perfil de freelancer' })
  async createFreelancerProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateFreelancerProfileDto,
  ) {
    return this.profilesService.createFreelancerProfile(userId, dto);
  }

  @Get('freelancer/:id')
  @ApiOperation({
    summary: 'Ver perfil de freelancer',
    description: 'Retorna os dados de um perfil de freelancer pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Perfil de freelancer encontrado' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async getFreelancerProfile(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.profilesService.getFreelancerProfile(id);
  }

  @Patch('freelancer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Atualizar perfil de freelancer',
    description: 'Atualiza o perfil de freelancer do utilizador autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado' })
  async updateFreelancerProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateFreelancerProfileDto,
  ) {
    return this.profilesService.updateFreelancerProfile(userId, dto);
  }

  // ─── Search Freelancers ───────────────────────────────────

  @Get('freelancers')
  @ApiOperation({
    summary: 'Pesquisar freelancers',
    description: 'Lista freelancers com filtros por nome, skill e paginação.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Pesquisa por nome, título ou bio',
  })
  @ApiQuery({
    name: 'skill',
    required: false,
    description: 'Filtrar por habilidade',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Registos por página',
    example: 20,
  })
  @ApiResponse({ status: 200, description: 'Lista de freelancers paginada' })
  async searchFreelancers(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('search') search?: string,
    @Query('skill') skill?: string,
  ) {
    return this.profilesService.searchFreelancers({
      ...paginationQuery,
      search,
      skill,
    });
  }
}
