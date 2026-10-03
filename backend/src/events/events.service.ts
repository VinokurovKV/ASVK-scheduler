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

const eventInclude = {
  calendar: true,
  creator: {
    select: {
      id: true,
      name: true,
      username: true,
      authProvider: true,
    },
  },
} as const;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.event.findMany({
      where: {
        calendar: {
          ownerId: userId,
        },
      },
      orderBy: {
        startsAt: 'asc',
      },
      include: eventInclude,
    });
  }

  async create(userId: number, input: CreateEventInput) {
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);

    validateEventDetails(
      startsAt,
      endsAt,
      input.format,
      input.room,
      input.meetingUrl,
    );

    const calendar = await this.prisma.calendar.findFirst({
      where: {
        ownerId: userId,
        type: 'PERSONAL',
      },
      select: {
        id: true,
      },
    });

    if (!calendar) {
      throw new NotFoundException('Personal calendar not found');
    }

    return this.prisma.event.create({
      data: {
        title: input.title,
        description: input.description,

        startsAt,
        endsAt,

        eventType: input.eventType ?? 'MEETING',
        format: input.format,
        repeatInterval: input.repeatInterval ?? 'NONE',

        room: input.format === 'OFFLINE' ? input.room : null,

        meetingUrl: input.format === 'ONLINE' ? input.meetingUrl : null,

        calendar: {
          connect: {
            id: calendar.id,
          },
        },

        creator: {
          connect: {
            id: userId,
          },
        },
      },

      include: eventInclude,
    });
  }

  async update(userId: number, id: number, input: UpdateEventInput) {
    const existingEvent = await this.prisma.event.findFirst({
      where: {
        id,
        calendar: {
          ownerId: userId,
        },
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

        eventType: input.eventType,
        format,
        repeatInterval: input.repeatInterval,

        room,
        meetingUrl,
      },
      include: eventInclude,
    });
  }

  async remove(userId: number, id: number) {
    const result = await this.prisma.event.deleteMany({
      where: {
        id,
        calendar: {
          ownerId: userId,
        },
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Event not found');
    }
  }
}
