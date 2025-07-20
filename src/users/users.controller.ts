import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'lib/auth/JwtAuthGuard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('random')
  async getRandomUser() {
    return this.usersService.findRandomUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() request: Request) {
    return this.usersService.findUserById(id, request.user?.id as string);
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed/search')
  async searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }
}
