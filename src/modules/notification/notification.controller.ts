import { AuthUser, B2CGuard, Roles, RolesGuard } from '@adatechnology/auth-keycloak';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ROLES } from '@modules/shared/constants';
import { Notification } from '@modules/shared/providers/database/entities/notification.entity';
import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';

import { type NotificationServiceInterface } from './notification.service';
import { NOTIFICATION_SERVICE_PROVIDE } from './notification.token';

@ApiTags('Notifications')
@Controller('/notifications')
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_SERVICE_PROVIDE)
    private readonly notificationService: NotificationServiceInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
  ) {}

  @Get()
  @Roles(ROLES.NOTIFICATION.SENDER)
  @UseGuards(B2CGuard, RolesGuard)
  @ApiOperation({ summary: 'Listar notificações do usuário autenticado' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiOkResponse({ type: [Notification] })
  async list(@AuthUser() keycloakId: string): Promise<Notification[]> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.notificationService.list(user.id);
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiNoContentResponse()
  async markAsRead(@Param('id') id: string): Promise<void> {
    await this.notificationService.markAsRead(id);
  }
}
