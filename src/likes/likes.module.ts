import { Module } from '@nestjs/common';

import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [LikesController],
  providers: [LikesService, JwtService, NotificationsService],
})
export class LikesModule {}
