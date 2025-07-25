import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [LikesController],
  providers: [LikesService, JwtService],
})
export class LikesModule {}
