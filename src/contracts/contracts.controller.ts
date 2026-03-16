import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ContractsService } from './contracts.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@ApiTags('Contracts')
@ApiBearerAuth('JWT')
@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar contratos',
    description:
      'Lista os contratos do utilizador autenticado (como cliente ou freelancer).',
  })
  @ApiResponse({ status: 200, description: 'Lista de contratos' })
  async findAll(@CurrentUser('sub') userId: string) {
    return this.contractsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalhe do contrato',
    description:
      'Retorna os detalhes de um contrato incluindo projeto, pagamento e avaliações.',
  })
  @ApiResponse({ status: 200, description: 'Contrato encontrado' })
  @ApiResponse({ status: 404, description: 'Contrato não encontrado' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Concluir contrato',
    description:
      'Marca o contrato como concluído. Apenas o cliente pode executar esta ação.',
  })
  @ApiResponse({ status: 200, description: 'Contrato concluído' })
  @ApiResponse({ status: 400, description: 'Contrato não está ativo' })
  @ApiResponse({ status: 403, description: 'Apenas o cliente pode concluir' })
  async complete(
    @CurrentUser('sub') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.contractsService.complete(userId, id);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Cancelar contrato (Admin)',
    description: 'Cancela um contrato. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Contrato cancelado' })
  @ApiResponse({ status: 400, description: 'Contrato já cancelado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async cancel(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contractsService.cancel(id);
  }
}
