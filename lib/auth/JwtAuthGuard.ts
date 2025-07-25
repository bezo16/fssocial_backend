import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from 'lib/drizzle/schema';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();
    const token = request.headers['authorization'] as string;

    if (!token) throw new UnauthorizedException('No token provided');
    try {
      const user: User = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET as string,
      });
      request.user = user;
      return true;
    } catch (error) {
      console.error('JWT verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
