import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import db from 'lib/drizzle';
import { usersTable } from 'lib/drizzle/schema';
import * as argon2 from 'argon2';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    // private usersService: UsersService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

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
    const user = await this.usersService.findOneUserByUsername({
      username: loginAuthDto.username,
    });

    const isPasswordValid = await argon2.verify(
      user.password_hash,
      loginAuthDto.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid username of password.');
    }

    const jwtToken = await this.jwtService.signAsync(user);
    return { token: jwtToken };
  }
}
