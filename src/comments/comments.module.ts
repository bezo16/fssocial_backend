import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, JwtService],
})
export class CommentsModule {}
