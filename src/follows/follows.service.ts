import { Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import db from 'lib/drizzle';
import { followsTable } from 'lib/drizzle/schema';
import { sql } from 'drizzle-orm';

@Injectable()
export class FollowsService {
  followUser(createFollowDto: CreateFollowDto, userId: string) {
    return db.insert(followsTable).values({
      followerId: userId,
      followingId: createFollowDto.followingId,
    });
  }

  unFollowUser(createFollowDto: CreateFollowDto, userId: string) {
    return db
      .delete(followsTable)
      .where(
        sql`${followsTable.followerId} = ${userId} and ${followsTable.followingId} = ${createFollowDto.followingId}`,
      );
  }
}
