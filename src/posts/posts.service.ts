import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import db from 'lib/drizzle';
import { postsTable } from 'lib/drizzle/schema';
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
}
