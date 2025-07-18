import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import db from 'lib/drizzle';
import { postsTable } from 'lib/drizzle/schema';

@Injectable()
export class PostsService {
  findAll(userId: string) {
    return db.select().from(postsTable).where(eq(postsTable.authorId, userId));
  }
}
