import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import db from 'lib/drizzle';
import { usersTable } from 'lib/drizzle/schema';
import * as argon2 from 'argon2';
import { LoginAuthDto } from './dto/login-auth.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  async register(registerAuthDto: RegisterAuthDto) {
    let passwordHash: string;
    try {
      passwordHash = await argon2.hash(registerAuthDto.password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 4,
        parallelism: 1,
      });
    } catch (err) {
      console.error('Error hashing password with Argon2:', err);
      throw new BadRequestException('Failed to hash password.');
    }
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        username: registerAuthDto.username,
        email: registerAuthDto.email,
        password_hash: passwordHash,
      })
      .returning();

    return createdUser;
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, loginAuthDto.username))
      .limit(1);

    if (user.length === 0) {
      throw new BadRequestException('Invalid username of password.');
    }

    const isPasswordValid = await argon2.verify(
      user[0].password_hash,
      loginAuthDto.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid username of password.');
    }

    return user[0];
  }
}
