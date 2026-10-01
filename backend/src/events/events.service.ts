import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type { CreateEventInput } from './events.types.js';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.event.findMany({
      orderBy: {
        startsAt: 'asc',
      },
      include: {
        calendar: true,
        creator: true,
      },
    });
  }

  create(input: CreateEventInput) {
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid event date');
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException('Event must end after it starts');
    }

    if (input.format === 'ONLINE' && !input.meetingUrl) {
      throw new BadRequestException('Online event must have a meeting URL');
    }

    if (input.format === 'OFFLINE' && !input.room) {
      throw new BadRequestException('Offline event must have a room');
    }

    return this.prisma.event.create({
      data: {
        title: input.title,
        description: input.description,

        startsAt,
        endsAt,

        format: input.format,

        room: input.format === 'OFFLINE' ? input.room : null,

        meetingUrl: input.format === 'ONLINE' ? input.meetingUrl : null,

        calendar: {
          connect: {
            id: input.calendarId,
          },
        },

        creator: {
          connect: {
            id: input.creatorId,
          },
        },
      },

      include: {
        calendar: true,
        creator: true,
      },
    });
  }
}
