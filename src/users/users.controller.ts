import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Patch,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'lib/auth/JwtAuthGuard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import pfpStorage from 'lib/multer/pfpStorage';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('random')
  async getRandomUser() {
    return this.usersService.findRandomUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserMe(@Req() request: Request) {
    return this.usersService.findUserMe(request.user?.id as string);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateUserMe(@Req() request: Request, @Body() body: { bio?: string }) {
    return await this.usersService.updateUserMe(
      request.user?.id as string,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: pfpStorage }))
  @Post('me/avatar')
  async updateUserMeAvatar(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.usersService.updateUserMeAvatar(request.user!.id, file);
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
