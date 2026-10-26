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
});
