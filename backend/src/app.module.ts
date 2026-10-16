import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module.js';
import { EventsModule } from './events/events.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { SupportModule } from './support/support.module.js';
import { CalendarsModule } from './calendars/calendars.module.js';
import { SystemModule } from './system/system.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 5,
      },
    ]),
    UsersModule,
    CalendarsModule,
    EventsModule,
    AuthModule,
    SupportModule,
    SystemModule,
  ],
})
export class AppModule {}
