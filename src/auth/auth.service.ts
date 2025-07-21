import { Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import generatePasswordHash from 'lib/argon2/generatePasswordHash';
import verifyPassword from 'lib/auth/verifyPassword';
import { Response } from 'express';
import { User } from 'lib/drizzle/schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto) {
    const passwordHash = await generatePasswordHash(registerAuthDto.password);
    const createdUser = await this.usersService.createUser({
      username: registerAuthDto.username,
      email: registerAuthDto.email,
      password_hash: passwordHash,
    });

    return createdUser;
  }

  async login(loginAuthDto: LoginAuthDto, response: Response) {
    const user = await this.usersService.findOneUserByUsername({
      username: loginAuthDto.username,
    });

    await verifyPassword(user.password_hash, loginAuthDto.password);

    const token = await this.jwtService.signAsync(user);

    response.cookie('authToken', token, {
      httpOnly: false,
      secure: false,
      maxAge: 36000000,
      sameSite: 'none',
      path: '/',
    });
    return { token };
  }

  verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify<User>(token);
      return { valid: true, decoded };
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid token');
    }
  }
}
