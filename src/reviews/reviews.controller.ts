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
import { ReviewsService } from './reviews.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateReviewDto } from './dto/review.dto.js';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Criar avaliação',
    description:
      'Cria uma avaliação para um contrato concluído. Cada parte avalia uma vez por contrato.',
  })
  @ApiResponse({ status: 201, description: 'Avaliação criada' })
  @ApiResponse({ status: 400, description: 'Contrato não concluído' })
  @ApiResponse({ status: 403, description: 'Sem permissão para avaliar' })
  @ApiResponse({ status: 409, description: 'Já avaliou este contrato' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, dto);
  }

  @Get('freelancer/:id')
  @ApiOperation({
    summary: 'Avaliações de um freelancer',
    description:
      'Lista todas as avaliações recebidas por um freelancer, com média de estrelas.',
  })
  @ApiResponse({ status: 200, description: 'Lista de avaliações com média' })
  async findByFreelancer(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.reviewsService.findByFreelancer(id);
  }

  @Get('client/:id')
  @ApiOperation({
    summary: 'Avaliações de um cliente',
    description:
      'Lista todas as avaliações recebidas por um cliente, com média de estrelas.',
  })
  @ApiResponse({ status: 200, description: 'Lista de avaliações com média' })
  async findByClient(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.reviewsService.findByClient(id);
  }
}
