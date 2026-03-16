import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar categorias',
    description: 'Retorna todas as categorias raiz com as suas subcategorias.',
  })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalhe da categoria',
    description:
      'Retorna uma categoria pelo ID com subcategorias e categoria pai.',
  })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Criar categoria (Admin)',
    description:
      'Cria uma nova categoria ou subcategoria. Apenas administradores.',
  })
  @ApiResponse({ status: 201, description: 'Categoria criada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Atualizar categoria (Admin)',
    description: 'Atualiza uma categoria existente. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Categoria atualizada' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Eliminar categoria (Admin)',
    description: 'Remove uma categoria. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Categoria removida' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoriesService.remove(id);
  }
}
