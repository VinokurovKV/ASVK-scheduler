import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
