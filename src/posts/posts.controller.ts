import { Controller, Get, Headers, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'lib/drizzle/schema';
import { Request } from 'express';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('profile/me')
  async findMe(@Req() request: Request & { cookies: { authToken: string } }) {
    const jwtToken = request.cookies.authToken;
    console.log(request.cookies);
    if (!jwtToken) {
      throw new Error('Authorization token is missing');
    }
    try {
      const user: User = this.jwtService.verify(jwtToken, {
        secret: process.env.JWT_SECRET,
      });

      return this.postsService.findAll(user.id);
    } catch (error) {
      console.error('Error retrieving user posts:', error);
      throw new Error('Failed to retrieve user');
    }
  }
}
