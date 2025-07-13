import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import db from 'lib/drizzle';
import { usersTable } from 'lib/drizzle/schema';
import * as argon2 from 'argon2';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import generatePasswordHash from 'lib/argon2/generatePasswordHash';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto) {
    const passwordHash = await generatePasswordHash(registerAuthDto.password);

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
