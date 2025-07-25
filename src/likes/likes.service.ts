import { Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import db from 'lib/drizzle';
import { likesTable } from 'lib/drizzle/schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class LikesService {
  async create(createLikeDto: CreateLikeDto, userId: string) {
    await db.insert(likesTable).values({
      userId,
      targetType: createLikeDto.targetType,
      targetId: createLikeDto.targetId,
    });
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
