import { Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import generatePasswordHash from 'lib/argon2/generatePasswordHash';
import verifyPassword from 'lib/auth/verifyPassword';

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

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.usersService.findOneUserByUsername({
      username: loginAuthDto.username,
    });

    await verifyPassword(user.password_hash, loginAuthDto.password);

    const jwtToken = await this.jwtService.signAsync(user);
    return { token: jwtToken };
  }
}
