import {
  Controller,
  Get,
  Patch,
  Param,
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
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard',
    description:
      'Resumo geral: total de utilizadores, projetos, contratos e volume de pagamentos. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Resumo do dashboard' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({
    summary: 'Listar utilizadores',
    description:
      'Lista todos os utilizadores com pesquisa e paginação. Apenas administradores.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Pesquisa por nome ou email',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista de utilizadores paginada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async listUsers(
    @Query() query: PaginationQueryDto,
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers({ ...query, search });
  }

  @Patch('users/:id/toggle-status')
  @ApiOperation({
    summary: 'Ativar/desativar conta',
    description:
      'Alterna o estado ativo/inativo de um utilizador. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Estado alterado' })
  async toggleUserStatus(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  @Get('projects')
  @ApiOperation({
    summary: 'Listar todos os projetos',
    description:
      'Lista todos os projetos (independente do estado). Apenas administradores.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista de projetos paginada' })
  async listProjects(@Query() query: PaginationQueryDto) {
    return this.adminService.listProjects(query);
  }

  @Get('contracts')
  @ApiOperation({
    summary: 'Listar todos os contratos',
    description: 'Lista todos os contratos. Apenas administradores.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista de contratos paginada' })
  async listContracts(@Query() query: PaginationQueryDto) {
    return this.adminService.listContracts(query);
  }

  @Get('payments')
  @ApiOperation({
    summary: 'Resumo financeiro',
    description:
      'Retorna o resumo de todos os pagamentos da plataforma. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Resumo financeiro' })
  async getPaymentsSummary() {
    return this.adminService.getPaymentsSummary();
  }
}
