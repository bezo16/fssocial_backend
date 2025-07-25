import { Controller, Post, Body, UseGuards, Req, Delete } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { JwtAuthGuard } from 'lib/auth/JwtAuthGuard';
import { Request } from 'express';
import { DeleteLikeDto } from './dto/delete-like.dto';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createLikeDto: CreateLikeDto, @Req() req: Request) {
    return this.likesService.create(createLikeDto, req.user!.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  remove(@Body() deleteLikeDto: DeleteLikeDto, @Req() req: Request) {
    return this.likesService.remove(
      deleteLikeDto.targetType,
      deleteLikeDto.targetId,
      req.user!.id,
    );
  }
}
