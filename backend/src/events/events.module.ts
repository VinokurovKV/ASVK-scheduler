import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module.js';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
