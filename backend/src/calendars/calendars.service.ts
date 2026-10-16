import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CalendarType } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma.service.js';

export interface CalendarAccessUser {
  id: number;
  groupNumber: string | null;
  appRoles: Array<'GROUP_LEADER' | 'OWNER'>;
}

export interface AccessibleCalendar {
  id: number;
  name: string;
  type: 'PERSONAL' | 'GROUP' | 'DEPARTMENT';
  groupNumber: string | null;
  ownerId: number | null;
}

@Injectable()
export class CalendarsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccessUser(userId: number): Promise<CalendarAccessUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        groupNumber: true,
        appRoles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async ensureGroupCalendar(groupNumber: string | null) {
    if (!groupNumber) {
      return null;
    }

    return this.prisma.calendar.upsert({
      where: {
        type_groupNumber: {
          type: 'GROUP',
          groupNumber,
        },
      },
      create: {
        name: `Группа ${groupNumber}`,
        type: 'GROUP',
        groupNumber,
      },
      update: {},
    });
  }

  canView(user: CalendarAccessUser, calendar: AccessibleCalendar) {
    if (calendar.type === 'PERSONAL') {
      return calendar.ownerId === user.id;
    }

    if (user.appRoles.includes('OWNER')) {
      return true;
    }

    return (
      calendar.type === 'GROUP' &&
      Boolean(user.groupNumber) &&
      calendar.groupNumber === user.groupNumber
    );
  }

  canManage(user: CalendarAccessUser, calendar: AccessibleCalendar) {
    if (calendar.type === 'PERSONAL') {
      return calendar.ownerId === user.id;
    }

    if (user.appRoles.includes('OWNER')) {
      return true;
    }

    return (
      calendar.type === 'GROUP' &&
      user.appRoles.includes('GROUP_LEADER') &&
      Boolean(user.groupNumber) &&
      calendar.groupNumber === user.groupNumber
    );
  }

  async findAll(userId: number) {
    const user = await this.getAccessUser(userId);

    await this.ensureGroupCalendar(user.groupNumber);

    const calendars = await this.prisma.calendar.findMany({
      where: {
        OR: [
          {
            type: 'PERSONAL',
            ownerId: user.id,
          },
          ...(user.appRoles.includes('OWNER')
            ? [
                {
                  type: {
                    in: [CalendarType.GROUP, CalendarType.DEPARTMENT],
                  },
                },
              ]
            : user.groupNumber
              ? [{ type: 'GROUP' as const, groupNumber: user.groupNumber }]
              : []),
        ],
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return calendars.map((calendar) => ({
      ...calendar,
      canManage: this.canManage(user, calendar),
    }));
  }

  async getCalendarForViewing(user: CalendarAccessUser, calendarId: number) {
    const calendar = await this.prisma.calendar.findUnique({
      where: { id: calendarId },
    });

    if (!calendar || !this.canView(user, calendar)) {
      throw new NotFoundException('Calendar not found');
    }

    return calendar;
  }

  async getCalendarForManaging(user: CalendarAccessUser, calendarId: number) {
    const calendar = await this.getCalendarForViewing(user, calendarId);

    if (!this.canManage(user, calendar)) {
      throw new ForbiddenException('Calendar is read-only');
    }

    return calendar;
  }
}
