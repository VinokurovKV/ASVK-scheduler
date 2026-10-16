import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CalendarsService } from '../calendars/calendars.service.js';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly calendarsService: CalendarsService,
  ) {}

  async findAll(userId: number) {
    const calendars = await this.calendarsService.findAll(userId);
    const calendarPermissions = new Map(
      calendars.map((calendar) => [calendar.id, calendar.canManage]),
    );

    const events = await this.prisma.event.findMany({
      where: {
        calendarId: {
          in: calendars.map((calendar) => calendar.id),
        },
      },
      orderBy: {
        startsAt: 'asc',
      },
      include: eventInclude,
    });

    return events.map((event) => ({
      ...event,
      canEdit: calendarPermissions.get(event.calendarId) === true,
    }));
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

    const user = await this.calendarsService.getAccessUser(userId);

    if (
      input.calendarId !== undefined &&
      (!Number.isInteger(input.calendarId) || input.calendarId <= 0)
    ) {
      throw new BadRequestException('Calendar has an invalid value');
    }

    const calendar = input.calendarId
      ? await this.calendarsService.getCalendarForManaging(
          user,
          input.calendarId,
        )
      : await this.prisma.calendar.findFirst({
          where: {
            ownerId: userId,
            type: 'PERSONAL',
          },
        });

    if (!calendar) {
      throw new NotFoundException('Personal calendar not found');
    }

    const event = await this.prisma.event.create({
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

    return { ...event, canEdit: true };
  }

  async update(userId: number, id: number, input: UpdateEventInput) {
    const user = await this.calendarsService.getAccessUser(userId);
    const existingEvent = await this.prisma.event.findUnique({
      where: {
        id,
      },
      include: { calendar: true },
    });

    if (
      !existingEvent ||
      !this.calendarsService.canView(user, existingEvent.calendar)
    ) {
      throw new NotFoundException('Event not found');
    }

    if (!this.calendarsService.canManage(user, existingEvent.calendar)) {
      throw new ForbiddenException('Event is read-only');
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

    const event = await this.prisma.event.update({
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

    return { ...event, canEdit: true };
  }

  async remove(userId: number, id: number) {
    const user = await this.calendarsService.getAccessUser(userId);
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { calendar: true },
    });

    if (!event || !this.calendarsService.canView(user, event.calendar)) {
      throw new NotFoundException('Event not found');
    }

    if (!this.calendarsService.canManage(user, event.calendar)) {
      throw new ForbiddenException('Event is read-only');
    }

    await this.prisma.event.delete({ where: { id } });
  }
}
