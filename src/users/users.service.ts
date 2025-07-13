import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FindOneUserDto } from './dto/find-one-user.dto';
import db from 'lib/drizzle';
import { eq } from 'drizzle-orm';
import { usersTable } from 'lib/drizzle/schema';

@Injectable()
export class UsersService {
  async findOneUserByUsername(userInfo: FindOneUserDto) {
    try {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, userInfo.username))
        .limit(1);

      if (user.length === 0) {
        throw new UnauthorizedException('Failed to login');
      }

      return user[0];
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Failed to login');
    }
  }
}
