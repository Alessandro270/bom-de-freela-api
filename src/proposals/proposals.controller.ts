import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
import { ProposalsService } from './proposals.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateProposalDto, UpdateProposalDto } from './dto/proposal.dto.js';

@ApiTags('Proposals')
@ApiBearerAuth('JWT')
@Controller('proposals')
@UseGuards(JwtAuthGuard)
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @ApiOperation({
    summary: 'Enviar proposta',
    description:
      'Envia uma proposta a um projeto. Requer perfil de freelancer. Um freelancer só pode ter uma proposta ativa por projeto.',
  })
  @ApiResponse({ status: 201, description: 'Proposta enviada' })
  @ApiResponse({
    status: 403,
    description: 'Perfil de freelancer necessário ou projeto próprio',
  })
  @ApiResponse({
    status: 409,
    description: 'Já possui proposta ativa neste projeto',
  })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateProposalDto,
  ) {
    return this.proposalsService.create(userId, dto);
  }

  @Get('mine')
  @ApiOperation({
    summary: 'Minhas propostas',
    description:
      'Lista todas as propostas enviadas pelo freelancer autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de propostas' })
  async findMine(@CurrentUser('sub') userId: string) {
    return this.proposalsService.findMine(userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Editar proposta',
    description: 'Edita uma proposta pendente (valor, prazo ou mensagem).',
  })
  @ApiResponse({ status: 200, description: 'Proposta atualizada' })
  @ApiResponse({ status: 400, description: 'Proposta não está pendente' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProposalDto,
  ) {
    return this.proposalsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Retirar proposta',
    description: 'Retira uma proposta pendente.',
  })
  @ApiResponse({ status: 200, description: 'Proposta retirada' })
  @ApiResponse({ status: 400, description: 'Proposta não está pendente' })
  async withdraw(
    @CurrentUser('sub') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.proposalsService.withdraw(userId, id);
  }

  @Patch(':id/accept')
  @ApiOperation({
    summary: 'Aceitar proposta',
    description:
      'Aceita uma proposta. Cria contrato automaticamente e recusa as demais propostas pendentes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Proposta aceite e contrato criado',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas o dono do projeto pode aceitar',
  })
  async accept(
    @CurrentUser('sub') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.proposalsService.accept(userId, id);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Recusar proposta',
    description: 'Recusa uma proposta pendente.',
  })
  @ApiResponse({ status: 200, description: 'Proposta recusada' })
  @ApiResponse({
    status: 403,
    description: 'Apenas o dono do projeto pode recusar',
  })
  async reject(
    @CurrentUser('sub') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.proposalsService.reject(userId, id);
  }
}
