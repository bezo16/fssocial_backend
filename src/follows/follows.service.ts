import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import db from 'lib/drizzle';
import { followsTable } from 'lib/drizzle/schema';
import { sql } from 'drizzle-orm';

@Injectable()
export class FollowsService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async followUser(createFollowDto: CreateFollowDto, userId: string) {
    if (userId === createFollowDto.followingId) {
      throw new Error('Cannot follow yourself');
    }
    await db.insert(followsTable).values({
      followerId: userId,
      followingId: createFollowDto.followingId,
    });
    // Notifikácia pre sledovaného používateľa
    if (userId !== createFollowDto.followingId) {
      await this.notificationsService.create({
        toUserId: createFollowDto.followingId,
        fromUserId: userId,
        type: 'follow',
        message: `Máte nového followera.`,
      });
    }
    return { message: 'Followed' };
  }

  unFollowUser(createFollowDto: CreateFollowDto, userId: string) {
    return db
      .delete(followsTable)
      .where(
        sql`${followsTable.followerId} = ${userId} and ${followsTable.followingId} = ${createFollowDto.followingId}`,
      );
  }
}
