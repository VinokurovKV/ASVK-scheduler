import { Injectable } from '@nestjs/common';
import { CalendarsService } from '../calendars/calendars.service.js';
import { PrismaService } from '../prisma.service.js';

const meetingInclude = {
  calendar: true,
  creator: {
    select: {
      id: true,
      name: true,
      username: true,
      authProvider: true,
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
}
