import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [FollowsController],
  providers: [FollowsService, JwtService],
})
export class FollowsModule {}
