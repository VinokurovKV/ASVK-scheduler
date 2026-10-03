import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma.service.js';
import { EventsService } from './events.service.js';

const createPrismaMock = () => ({
  calendar: {
    findFirst: vi.fn(),
  },
  event: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
});

describe('EventsService ownership', () => {
  it('returns only events from calendars owned by the current user', async () => {
    const prisma = createPrismaMock();
    prisma.event.findMany.mockResolvedValue([]);
    const service = new EventsService(prisma as unknown as PrismaService);

    await service.findAll(42);

    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          calendar: {
            ownerId: 42,
          },
        },
      }),
    );
  });

  it('uses the current user and their personal calendar when creating an event', async () => {
    const prisma = createPrismaMock();
    prisma.calendar.findFirst.mockResolvedValue({ id: 7 });
    prisma.event.create.mockResolvedValue({ id: 1 });
    const service = new EventsService(prisma as unknown as PrismaService);

    await service.create(42, {
      title: 'Семинар',
      startsAt: '2026-10-05T10:00:00.000Z',
      endsAt: '2026-10-05T11:00:00.000Z',
      eventType: 'SEMINAR',
      format: 'OFFLINE',
      repeatInterval: 'WEEK',
      room: 'П-8',
    });

    expect(prisma.calendar.findFirst).toHaveBeenCalledWith({
      where: {
        ownerId: 42,
        type: 'PERSONAL',
      },
      select: {
        id: true,
      },
    });
    expect(prisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          calendar: {
            connect: {
              id: 7,
            },
          },
          creator: {
            connect: {
              id: 42,
            },
          },
        }),
      }),
    );
  });

  it('does not delete an event outside the current user calendar', async () => {
    const prisma = createPrismaMock();
    prisma.event.deleteMany.mockResolvedValue({ count: 0 });
    const service = new EventsService(prisma as unknown as PrismaService);

    await expect(service.remove(42, 10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.event.deleteMany).toHaveBeenCalledWith({
      where: {
        id: 10,
        calendar: {
          ownerId: 42,
        },
      },
    });
  });

  it('looks up an event through the current user calendar before updating it', async () => {
    const prisma = createPrismaMock();
    prisma.event.findFirst.mockResolvedValue({
      id: 10,
      startsAt: new Date('2026-10-05T10:00:00.000Z'),
      endsAt: new Date('2026-10-05T11:00:00.000Z'),
      format: 'OFFLINE',
      room: 'П-8',
      meetingUrl: null,
    });
    prisma.event.update.mockResolvedValue({ id: 10 });
    const service = new EventsService(prisma as unknown as PrismaService);

    await service.update(42, 10, {
      title: 'Обновлённый семинар',
    });

    expect(prisma.event.findFirst).toHaveBeenCalledWith({
      where: {
        id: 10,
        calendar: {
          ownerId: 42,
        },
      },
    });
  });
});
