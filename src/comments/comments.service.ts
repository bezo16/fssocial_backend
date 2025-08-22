import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { postsTable, commentsTable } from 'lib/drizzle/schema';
import { CreateCommentDto, CommentTargetType } from './dto/create-comment.dto';
import db from 'lib/drizzle';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class CommentsService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const { targetType, targetId, content } = createCommentDto;

    const [comment] = await db
      .insert(commentsTable)
      .values({
        userId,
        targetType,
        targetId,
        content,
      })
      .returning();

    // Notifikácia pre autora postu pri komentári na post
    if (targetType === CommentTargetType.POST) {
      const [post] = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, targetId));
      if (post && post.authorId !== userId) {
        await this.notificationsService.create({
          toUserId: post.authorId,
          fromUserId: userId,
          type: 'comment',
          message: `Váš príspevok bol komentovaný.`,
        });
      }
    }

    return comment;
  }
  async remove(commentId: string, userId: string) {
    const deleted = await db
      .delete(commentsTable)
      .where(
        and(eq(commentsTable.id, commentId), eq(commentsTable.userId, userId)),
      )
      .returning();

    return deleted[0];
  }
}
