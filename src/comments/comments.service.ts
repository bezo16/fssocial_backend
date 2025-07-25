import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { commentsTable } from 'lib/drizzle/schema';
import db from 'lib/drizzle';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class CommentsService {
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
