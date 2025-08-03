import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':userId')
  async findAllForUser(
    @Param('userId') userId: string,
  ): Promise<Notification[]> {
    return this.notificationsService.findAllForUser(userId);
  }

  @Post()
  async create(
    @Body() body: Omit<Notification, 'id' | 'createdAt' | 'read'>,
  ): Promise<Notification> {
    return this.notificationsService.create(body);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<Notification | undefined> {
    return this.notificationsService.markAsRead(id);
  }
}
