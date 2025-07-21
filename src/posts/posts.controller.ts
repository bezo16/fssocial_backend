import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'lib/auth/JwtAuthGuard';
import { CreatePostDto } from './dto/create-post.dto';
import { Post as UserPost } from 'lib/drizzle/schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async findMe(@Req() request: Request): Promise<UserPost[]> {
    return this.postsService.findAll(request.user!.id);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async findFeedPosts(@Req() request: Request) {
    return this.postsService.findFeedPosts(request.user!.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() request: Request,
  ): Promise<UserPost> {
    return await this.postsService.createPost(createPostDto, request.user!.id);
  }
}
