import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      cookies?: { authToken?: string };
      user?: Record<string, any>;
    }>();
    const token = request.cookies?.authToken;
    if (!token) throw new UnauthorizedException('No token provided');
    try {
      const user: Record<string, any> = this.jwtService.verify(token, {
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
