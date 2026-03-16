import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
} from './dto/project.dto.js';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Publicar projeto',
    description:
      'Publica um novo projeto. Apenas utilizadores com perfil de cliente.',
  })
  @ApiResponse({ status: 201, description: 'Projeto publicado com sucesso' })
  @ApiResponse({ status: 403, description: 'Perfil de cliente necessário' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar projetos abertos',
    description:
      'Lista projetos com estado "Aberto" com filtros por categoria, orçamento e pesquisa.',
  })
  @ApiResponse({ status: 200, description: 'Lista de projetos paginada' })
  async findAll(@Query() filters: ProjectFilterDto) {
    return this.projectsService.findAll(filters);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Meus projetos',
    description: 'Lista os projetos publicados pelo utilizador autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de projetos do utilizador' })
  async findMine(@CurrentUser('sub') userId: string) {
    return this.projectsService.findByClient(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalhe do projeto',
    description: 'Retorna os detalhes de um projeto com propostas recebidas.',
  })
  @ApiResponse({ status: 200, description: 'Projeto encontrado' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Editar projeto',
    description: 'Edita um projeto (apenas no estado "Aberto" e pelo dono).',
  })
  @ApiResponse({ status: 200, description: 'Projeto atualizado' })
  @ApiResponse({ status: 400, description: 'Projeto não está aberto' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Cancelar projeto',
    description: 'Cancela um projeto (não pode ter contrato ativo).',
  })
  @ApiResponse({ status: 200, description: 'Projeto cancelado' })
  @ApiResponse({ status: 400, description: 'Projeto com contrato ativo' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async cancel(
    @CurrentUser('sub') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.projectsService.cancel(userId, id);
  }
}
