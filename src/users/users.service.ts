import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FindOneUserDto } from './dto/find-one-user.dto';
import db from 'lib/drizzle';
import { eq, sql } from 'drizzle-orm';
import { usersTable, followsTable } from 'lib/drizzle/schema';

type CreateUserParas = {
  username: string;
  email: string;
  password_hash: string;
};

@Injectable()
export class UsersService {
  async findOneUserByUsername(userInfo: FindOneUserDto) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, userInfo.username))
      .limit(1);

    if (user.length === 0) throw new UnauthorizedException('Failed to login');

    return user[0];
  }

  async createUser({ username, email, password_hash }: CreateUserParas) {
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        username,
        email,
        password_hash,
      })
      .returning();

    return createdUser;
  }

  async findRandomUsers() {
    const users = await db
      .select()
      .from(usersTable)
      .orderBy(sql`RANDOM()`)
      .limit(10);

    return users;
  }

  async findUserById(id: string, currentUserId: string) {
    const [result] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        password_hash: usersTable.password_hash,
        created_at: usersTable.created_at,
        updated_at: usersTable.updated_at,
        followsCount: sql<number>`(
          SELECT COUNT(*) FROM ${followsTable}
          WHERE ${followsTable.followingId} = ${id}
        )`,
        isFollowed: currentUserId
          ? sql<boolean>`EXISTS (
              SELECT 1 FROM ${followsTable}
              WHERE ${followsTable.followingId} = ${id}
                AND ${followsTable.followerId} = ${currentUserId}
            )`
          : sql<boolean>`false`,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!result) throw new UnauthorizedException('User not found');

    return {
      ...result,
      followsCount: Number(result.followsCount) || 0,
      isFollowed: Boolean(result.isFollowed),
    };
  }

  async searchUsers(query: string) {
    const results = await db
      .select()
      .from(usersTable)
      .where(sql`${usersTable.username} ILIKE '%' || ${query} || '%'`)
      .limit(10);

    return results;
  }
}
