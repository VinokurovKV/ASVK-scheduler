import type { CalendarsService } from '../calendars/calendars.service.js';
import type { PrismaService } from '../prisma.service.js';
import { MeetingsService } from './meetings.service.js';

describe('MeetingsService', () => {
  it('returns accessible meetings with the current user relationship', async () => {
    const prisma = {
      event: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 1,
            creatorId: 42,
            calendarId: 7,
            participants: [],
          },
          {
            id: 2,
            creatorId: 10,
            calendarId: 8,
            participants: [
              {
                userId: 42,
                status: 'PENDING',
                user: {
                  id: 42,
                  name: 'Анна Петрова',
                  firstName: 'Анна',
                  lastName: 'Петрова',
                },
              },
            ],
          },
        ]),
      },
    };
    const calendars = {
      findAll: vi.fn().mockResolvedValue([
        { id: 7, canManage: true },
        { id: 8, canManage: false },
      ]),
    };
    const service = new MeetingsService(
      prisma as unknown as PrismaService,
      calendars as unknown as CalendarsService,
    );

    await expect(service.findAll(42)).resolves.toEqual([
      {
        id: 1,
        creatorId: 42,
        calendarId: 7,
        participants: [],
        canEdit: true,
        participationStatus: 'ORGANIZER',
      },
      {
        id: 2,
        creatorId: 10,
        calendarId: 8,
        participants: [
          {
            id: 42,
            name: 'Анна Петрова',
            firstName: 'Анна',
            lastName: 'Петрова',
            status: 'PENDING',
          },
        ],
        canEdit: false,
        participationStatus: 'PENDING',
      },
    ]);

    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          eventType: { in: ['MEETING', 'WORK_MEETING'] },
        }),
      }),
    );
  });

  it('creates a meeting in the organizer calendar with unique participants', async () => {
    const prisma = {
      calendar: {
        findFirst: vi.fn().mockResolvedValue({ id: 7 }),
      },
      user: {
        count: vi.fn().mockResolvedValue(2),
      },
      event: {
        create: vi.fn().mockResolvedValue({
          id: 3,
          creatorId: 42,
          calendarId: 7,
          participants: [
            {
              status: 'PENDING',
              user: {
                id: 10,
                name: 'Анна Петрова',
                firstName: 'Анна',
                lastName: 'Петрова',
              },
            },
          ],
        }),
      },
    };
    const calendars = { findAll: vi.fn() };
    const service = new MeetingsService(
      prisma as unknown as PrismaService,
      calendars as unknown as CalendarsService,
    );

    await service.create(42, {
      title: 'Научная группа',
      startsAt: '2026-10-27T10:00:00.000Z',
      endsAt: '2026-10-27T11:00:00.000Z',
      eventType: 'MEETING',
      format: 'OFFLINE',
      room: '247-а',
      participantIds: [10, 11, 10, 42],
    });

    expect(prisma.calendar.findFirst).toHaveBeenCalledWith({
      where: { ownerId: 42, type: 'PERSONAL' },
    });
    expect(prisma.user.count).toHaveBeenCalledWith({
      where: { id: { in: [10, 11] } },
    });
    expect(prisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          calendar: { connect: { id: 7 } },
          creator: { connect: { id: 42 } },
          participants: {
            create: [
              { user: { connect: { id: 10 } } },
              { user: { connect: { id: 11 } } },
            ],
          },
        }),
      }),
    );
  });
});
