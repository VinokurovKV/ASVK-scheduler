import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type {
  CalendarAccessUser,
  CalendarsService,
} from '../calendars/calendars.service.js';
import type { PrismaService } from '../prisma.service.js';
import { EventsService } from './events.service.js';

const accessUser: CalendarAccessUser = {
  id: 42,
  groupNumber: '421',
  appRoles: [],
};

const createPrismaMock = () => ({
  calendar: { findFirst: vi.fn() },
  event: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
});

const createCalendarsMock = () => ({
  findAll: vi.fn(),
  getAccessUser: vi.fn().mockResolvedValue(accessUser),
  getCalendarForManaging: vi.fn(),
  canView: vi.fn(),
  canManage: vi.fn(),
});

const createService = () => {
  const prisma = createPrismaMock();
  const calendars = createCalendarsMock();
  const service = new EventsService(
    prisma as unknown as PrismaService,
    calendars as unknown as CalendarsService,
  );

  return { prisma, calendars, service };
};

describe('EventsService calendar access', () => {
  it('returns events from every accessible calendar with edit permissions', async () => {
    const { prisma, calendars, service } = createService();
    calendars.findAll.mockResolvedValue([
      { id: 7, canManage: true },
      { id: 8, canManage: false },
    ]);
    prisma.event.findMany.mockResolvedValue([
      { id: 1, calendarId: 7 },
      { id: 2, calendarId: 8 },
    ]);

    await expect(service.findAll(42)).resolves.toEqual([
      { id: 1, calendarId: 7, canEdit: true },
      { id: 2, calendarId: 8, canEdit: false },
    ]);

    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { calendarId: { in: [7, 8] } },
      }),
    );
  });

  it('uses the personal calendar by default when creating an event', async () => {
    const { prisma, service } = createService();
    prisma.calendar.findFirst.mockResolvedValue({ id: 7 });
    prisma.event.create.mockResolvedValue({ id: 1 });

    await service.create(42, {
      title: 'Семинар',
      startsAt: '2026-10-05T10:00:00.000Z',
      endsAt: '2026-10-05T11:00:00.000Z',
      eventType: 'SEMINAR',
      format: 'OFFLINE',
      repeatInterval: 'WEEK',
      room: 'П-8',
      teacherName: '  Иванов Иван Иванович  ',
    });

    expect(prisma.calendar.findFirst).toHaveBeenCalledWith({
      where: { ownerId: 42, type: 'PERSONAL' },
    });
    expect(prisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          calendar: { connect: { id: 7 } },
          creator: { connect: { id: 42 } },
          teacherName: 'Иванов Иван Иванович',
        }),
      }),
    );
  });

  it('checks management rights for a selected calendar', async () => {
    const { prisma, calendars, service } = createService();
    calendars.getCalendarForManaging.mockResolvedValue({ id: 9 });
    prisma.event.create.mockResolvedValue({ id: 1 });

    await service.create(42, {
      title: 'Контрольная работа',
      startsAt: '2026-10-05T10:00:00.000Z',
      endsAt: '2026-10-05T11:00:00.000Z',
      eventType: 'SEMINAR',
      format: 'OFFLINE',
      room: 'П-8',
      calendarId: 9,
    });

    expect(calendars.getCalendarForManaging).toHaveBeenCalledWith(
      accessUser,
      9,
    );
  });

  it('does not expose an event from an inaccessible calendar', async () => {
    const { prisma, calendars, service } = createService();
    prisma.event.findUnique.mockResolvedValue({
      id: 10,
      calendar: { id: 11, type: 'GROUP' },
    });
    calendars.canView.mockReturnValue(false);

    await expect(service.remove(42, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('prevents a group member from editing a read-only group event', async () => {
    const { prisma, calendars, service } = createService();
    prisma.event.findUnique.mockResolvedValue({
      id: 10,
      calendar: { id: 8, type: 'GROUP', groupNumber: '421' },
    });
    calendars.canView.mockReturnValue(true);
    calendars.canManage.mockReturnValue(false);

    await expect(
      service.update(42, 10, { title: 'Новое название' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows an authorized user to update a group event', async () => {
    const { prisma, calendars, service } = createService();
    prisma.event.findUnique.mockResolvedValue({
      id: 10,
      startsAt: new Date('2026-10-05T10:00:00.000Z'),
      endsAt: new Date('2026-10-05T11:00:00.000Z'),
      format: 'OFFLINE',
      room: 'П-8',
      meetingUrl: null,
      calendar: { id: 8, type: 'GROUP', groupNumber: '421' },
    });
    calendars.canView.mockReturnValue(true);
    calendars.canManage.mockReturnValue(true);
    prisma.event.update.mockResolvedValue({ id: 10 });

    await expect(
      service.update(42, 10, { title: 'Обновлённый семинар' }),
    ).resolves.toEqual({ id: 10, canEdit: true });
  });

  it('clears the teacher when an academic event changes its type', async () => {
    const { prisma, calendars, service } = createService();
    prisma.event.findUnique.mockResolvedValue({
      id: 10,
      startsAt: new Date('2026-10-05T10:00:00.000Z'),
      endsAt: new Date('2026-10-05T11:00:00.000Z'),
      eventType: 'LECTURE',
      format: 'OFFLINE',
      room: 'П-8',
      meetingUrl: null,
      teacherName: 'Иванов Иван Иванович',
      calendar: { id: 8, type: 'GROUP', groupNumber: '421' },
    });
    calendars.canView.mockReturnValue(true);
    calendars.canManage.mockReturnValue(true);
    prisma.event.update.mockResolvedValue({ id: 10 });

    await service.update(42, 10, { eventType: 'MEETING' });

    expect(prisma.event.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ teacherName: null }),
      }),
    );
  });
});
