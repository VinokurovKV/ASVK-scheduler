import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      email: string;
    },
  ) {
    return this.usersService.create(body.name, body.email);
  }
}
