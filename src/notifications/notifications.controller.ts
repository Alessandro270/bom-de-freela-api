import {
  Controller,
  Get,
  Patch,
  Param,
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
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar notificações',
    description:
      'Lista as notificações do utilizador autenticado com paginação.',
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
  @ApiResponse({ status: 200, description: 'Lista de notificações paginada' })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.notificationsService.findAll(userId, query.page, query.limit);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Contador de não lidas',
    description: 'Retorna o número de notificações não lidas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contador de notificações não lidas',
  })
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Marcar como lida',
    description: 'Marca uma notificação específica como lida.',
  })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  async markAsRead(
    @CurrentUser('sub') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Marcar todas como lidas',
    description: 'Marca todas as notificações do utilizador como lidas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Todas as notificações marcadas como lidas',
  })
  async markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
