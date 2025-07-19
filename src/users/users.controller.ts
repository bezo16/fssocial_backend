import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('random')
  async getRandomUser() {
    return this.usersService.findRandomUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }
}
