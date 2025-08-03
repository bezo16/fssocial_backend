import { Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import db from 'lib/drizzle';
import { likesTable, postsTable } from 'lib/drizzle/schema';
import { NotificationsService } from '../notifications/notifications.service';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class LikesService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async create(createLikeDto: CreateLikeDto, userId: string) {
    await db.insert(likesTable).values({
      userId,
      targetType: createLikeDto.targetType,
      targetId: createLikeDto.targetId,
    });

    // Zistiť vlastníka cieľa (napr. postu)
    let toUserId: string | null = null;
    if (createLikeDto.targetType === 'post') {
      const [post] = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, createLikeDto.targetId));
      if (post) toUserId = post.authorId;
    }
    // TODO: Podobne pre profile, comment

    if (toUserId && toUserId !== userId) {
      await this.notificationsService.create({
        toUserId,
        fromUserId: userId,
        type: 'like',
        message: `Váš príspevok bol označený ako páči sa mi to.`,
      });
    }

    return { message: 'Like created' };
  }

  async remove(
    targetType: 'post' | 'profile' | 'comment',
    targetId: string,
    userId: string,
  ) {
    await db
      .delete(likesTable)
      .where(
        and(
          eq(likesTable.userId, userId),
          eq(likesTable.targetType, targetType),
          eq(likesTable.targetId, targetId),
        ),
      );
    return { message: 'Like removed' };
  }
}
