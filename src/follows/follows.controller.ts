import { Controller, Post, Body, Req, UseGuards, Delete } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'lib/auth/JwtAuthGuard';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  followUser(
    @Body() createFollowDto: CreateFollowDto,
    @Req() request: Request,
  ) {
    return this.followsService.followUser(
      createFollowDto,
      request.user?.id as string,
    );
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  unFollowUser(
    @Body() createFollowDto: CreateFollowDto,
    @Req() request: Request,
  ) {
    return this.followsService.unFollowUser(
      createFollowDto,
      request.user?.id as string,
    );
  }
}
