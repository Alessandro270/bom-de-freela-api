import {
  Controller,
  Get,
  Post,
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
import { PaymentsService } from './payments.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreatePaymentDto } from './dto/payment.dto.js';

@ApiTags('Payments')
@ApiBearerAuth('JWT')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Registar pagamento',
    description:
      'Efetua pagamento para um contrato concluído. Apenas o cliente. Valor >= valor do contrato.',
  })
  @ApiResponse({ status: 201, description: 'Pagamento registado' })
  @ApiResponse({
    status: 400,
    description: 'Contrato não concluído ou valor insuficiente',
  })
  @ApiResponse({ status: 403, description: 'Apenas o cliente pode pagar' })
  @ApiResponse({ status: 409, description: 'Contrato já possui pagamento' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(userId, dto);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Extrato de pagamentos',
    description:
      'Lista os pagamentos efetuados e recebidos pelo utilizador autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Extrato de pagamentos' })
  async getHistory(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getHistory(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalhe do pagamento',
    description: 'Retorna os detalhes de um pagamento pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.paymentsService.findOne(id);
  }
}
