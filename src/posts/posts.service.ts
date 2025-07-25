import { Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import db from 'lib/drizzle';
import { postsTable, usersTable } from 'lib/drizzle/schema';
import { followsTable } from 'lib/drizzle/schema';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  async findAll(userId: string) {
    return await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.authorId, userId))
      .orderBy(desc(postsTable.createdAt));
  }

  async createPost(postData: CreatePostDto, userId: string) {
    const [createdPost] = await db
      .insert(postsTable)
      .values({
        title: postData.title,
        content: postData.content,
        imageUrl: postData.imageUrl,
        authorId: userId,
      })
      .returning();

    return createdPost;
  }

  async findFeedPosts(userId: string) {
    return await db
      .select({
        post: postsTable,
        author: {
          id: usersTable.id,
          username: usersTable.username,
        },
        likes: {
          count: sql`(
            SELECT COUNT(*) FROM likes
            WHERE likes.target_type = 'post' AND likes.target_id = ${postsTable.id}
          )`.as('count'),
          isLiked: sql`EXISTS(
            SELECT 1 FROM likes
            WHERE likes.target_type = 'post' AND likes.target_id = ${postsTable.id} AND likes.user_id = ${userId}
            )`.as('isLiked'),
        },
      })
      .from(postsTable)
      .innerJoin(
        followsTable,
        eq(postsTable.authorId, followsTable.followingId),
      )
      .innerJoin(usersTable, eq(postsTable.authorId, usersTable.id))
      .where(eq(followsTable.followerId, userId))
      .orderBy(desc(postsTable.createdAt))
      .limit(20);
  }
}
