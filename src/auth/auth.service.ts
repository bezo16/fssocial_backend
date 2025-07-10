import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import db from 'lib/drizzle';
import { usersTable } from 'lib/drizzle/schema';

@Injectable()
export class AuthService {
  async register(createAuthDto: CreateAuthDto) {
    const [createdUser] = await db.insert(usersTable).values({
      username: createAuthDto.username,
      email: createAuthDto.email,
      password_hash: createAuthDto.password,
    }).returning();

    return createdUser;
  }

  login() {
    return `This action login user`;
  }
}
