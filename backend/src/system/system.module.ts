import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma.module.js';
import { OwnerGuard } from './owner.guard.js';
import { SystemController } from './system.controller.js';
import { SystemService } from './system.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SystemController],
  providers: [SystemService, OwnerGuard],
})
export class SystemModule {}
