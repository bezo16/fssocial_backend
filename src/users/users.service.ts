import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FindOneUserDto } from './dto/find-one-user.dto';
import db from 'lib/drizzle';
import { eq, sql } from 'drizzle-orm';
import { usersTable } from 'lib/drizzle/schema';

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

  async findUserById(id: string) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (user.length === 0) throw new UnauthorizedException('User not found');

    return user[0];
  }
}
