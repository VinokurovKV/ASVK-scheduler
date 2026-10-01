import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type {
  CreateEventInput,
  EventFormat,
  UpdateEventInput,
} from './events.types.js';

const validateEventDetails = (
  startsAt: Date,
  endsAt: Date,
  format: EventFormat,
  room?: string | null,
  meetingUrl?: string | null,
) => {
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new BadRequestException('Invalid event date');
  }

  if (endsAt <= startsAt) {
    throw new BadRequestException('Event must end after it starts');
  }

  if (format === 'ONLINE' && !meetingUrl) {
    throw new BadRequestException('Online event must have a meeting URL');
  }

  if (format === 'OFFLINE' && !room) {
    throw new BadRequestException('Offline event must have a room');
  }
};

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

    validateEventDetails(
      startsAt,
      endsAt,
      input.format,
      input.room,
      input.meetingUrl,
    );

    return this.prisma.event.create({
      data: {
        title: input.title,
        description: input.description,

        startsAt,
        endsAt,

        format: input.format,
        repeatInterval: input.repeatInterval ?? 'NONE',

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

  async update(id: number, input: UpdateEventInput) {
    const existingEvent = await this.prisma.event.findUnique({
      where: {
        id,
      },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const startsAt =
      input.startsAt !== undefined
        ? new Date(input.startsAt)
        : existingEvent.startsAt;

    const endsAt =
      input.endsAt !== undefined
        ? new Date(input.endsAt)
        : existingEvent.endsAt;

    const format = input.format ?? existingEvent.format;

    const room =
      format === 'OFFLINE' ? (input.room ?? existingEvent.room) : null;

    const meetingUrl =
      format === 'ONLINE'
        ? (input.meetingUrl ?? existingEvent.meetingUrl)
        : null;

    validateEventDetails(startsAt, endsAt, format, room, meetingUrl);

    return this.prisma.event.update({
      where: {
        id,
      },
      data: {
        title: input.title,
        description: input.description,

        startsAt,
        endsAt,

        format,
        repeatInterval: input.repeatInterval,

        room,
        meetingUrl,
      },
      include: {
        calendar: true,
        creator: true,
      },
    });
  }

  async remove(id: number) {
    const result = await this.prisma.event.deleteMany({
      where: {
        id,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Event not found');
    }
  }
}
