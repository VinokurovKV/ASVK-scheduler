import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module.js';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { CalendarsModule } from '../calendars/calendars.module.js';

@Module({
  imports: [PrismaModule, AuthModule, CalendarsModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
