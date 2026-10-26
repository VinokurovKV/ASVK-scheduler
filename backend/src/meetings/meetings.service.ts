import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CalendarsService } from '../calendars/calendars.service.js';
import { PrismaService } from '../prisma.service.js';
import type { CreateMeetingInput } from './meetings.types.js';

const meetingInclude = {
  calendar: true,
  creator: {
    select: {
      id: true,
      name: true,
      username: true,
      authProvider: true,
      role: true,
      groupNumber: true,
    },
  },
  participants: {
    select: {
      userId: true,
      status: true,
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calendarsService: CalendarsService,
  ) {}

  async findAll(userId: number) {
    const calendars = await this.calendarsService.findAll(userId);
    const calendarPermissions = new Map(
      calendars.map((calendar) => [calendar.id, calendar.canManage]),
    );

    const meetings = await this.prisma.event.findMany({
      where: {
        eventType: { in: ['MEETING', 'WORK_MEETING'] },
        OR: [
          { calendarId: { in: calendars.map((calendar) => calendar.id) } },
          { creatorId: userId },
          { participants: { some: { userId } } },
        ],
      },
      orderBy: { startsAt: 'asc' },
      include: meetingInclude,
    });

    return meetings.map(({ participants, ...meeting }) => {
      const currentParticipation = participants.find(
        (participant) => participant.userId === userId,
      );

      return {
        ...meeting,
        participants: participants
          .filter((participant) => participant.status !== 'DECLINED')
          .map(({ user, status }) => ({ ...user, status })),
        canEdit:
          meeting.creatorId === userId ||
          calendarPermissions.get(meeting.calendarId) === true,
        participationStatus:
          meeting.creatorId === userId
            ? ('ORGANIZER' as const)
            : (currentParticipation?.status ?? null),
      };
    });
  }

  async create(userId: number, input: CreateMeetingInput) {
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);

    if (!input.title?.trim()) {
      throw new BadRequestException('Meeting title is required');
    }

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid meeting date');
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException('Meeting must end after it starts');
    }

    if (!['MEETING', 'WORK_MEETING'].includes(input.eventType)) {
      throw new BadRequestException('Meeting type has an invalid value');
    }

    if (input.format === 'ONLINE' && !input.meetingUrl?.trim()) {
      throw new BadRequestException('Online meeting must have a URL');
    }

    if (input.format === 'OFFLINE' && !input.room?.trim()) {
      throw new BadRequestException('Offline meeting must have a room');
    }

    if (!Array.isArray(input.participantIds ?? [])) {
      throw new BadRequestException('Participants have an invalid value');
    }

    const participantIds = [
      ...new Set(input.participantIds ?? []),
    ].filter((participantId) => participantId !== userId);

    if (
      participantIds.some(
        (participantId) =>
          !Number.isInteger(participantId) || participantId <= 0,
      )
    ) {
      throw new BadRequestException('Participant has an invalid value');
    }

    const [calendar, participantsCount] = await Promise.all([
      this.prisma.calendar.findFirst({
        where: { ownerId: userId, type: 'PERSONAL' },
      }),
      this.prisma.user.count({
        where: { id: { in: participantIds } },
      }),
    ]);

    if (!calendar) {
      throw new NotFoundException('Personal calendar not found');
    }

    if (participantsCount !== participantIds.length) {
      throw new BadRequestException('Participant not found');
    }

    const meeting = await this.prisma.event.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        startsAt,
        endsAt,
        eventType: input.eventType,
        format: input.format,
        repeatInterval: input.repeatInterval ?? 'NONE',
        room: input.format === 'OFFLINE' ? input.room?.trim() : null,
        meetingUrl:
          input.format === 'ONLINE' ? input.meetingUrl?.trim() : null,
        calendar: { connect: { id: calendar.id } },
        creator: { connect: { id: userId } },
        participants: {
          create: participantIds.map((participantId) => ({
            user: { connect: { id: participantId } },
          })),
        },
      },
      include: meetingInclude,
    });

    return {
      ...meeting,
      participants: meeting.participants.map(({ user, status }) => ({
        ...user,
        status,
      })),
      canEdit: true,
      participationStatus: 'ORGANIZER' as const,
    };
  }
}
