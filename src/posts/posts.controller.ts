import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'lib/auth/JwtAuthGuard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async findMe(@Req() request: Request) {
    return this.postsService.findAll(request.user!.id);
  }
}
