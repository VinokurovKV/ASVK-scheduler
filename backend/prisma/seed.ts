import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.calendar.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: 'Кирилл Винокуров',
      username: 'kirill',
      email: 'kirill@asvk.cs.msu.ru',
      authProvider: 'ASVK',
    },
  });

  const calendar = await prisma.calendar.create({
    data: {
      name: 'Мой календарь',
      type: 'PERSONAL',
      ownerId: user.id,
    },
  });

  await prisma.event.createMany({
    data: [
      {
        title: 'Компиляторы',
        eventType: 'LECTURE',
        startsAt: new Date('2026-10-05T10:30:00+03:00'),
        endsAt: new Date('2026-10-05T12:05:00+03:00'),
        format: 'OFFLINE',
        room: 'П-8',
        calendarId: calendar.id,
        creatorId: user.id,
      },

      {
        title: 'Научный семинар',
        eventType: 'SEMINAR',
        startsAt: new Date('2026-10-07T12:20:00+03:00'),
        endsAt: new Date('2026-10-07T13:55:00+03:00'),
        format: 'OFFLINE',
        room: '764',
        calendarId: calendar.id,
        creatorId: user.id,
      },

      {
        title: 'Встреча научной группы',
        eventType: 'MEETING',
        startsAt: new Date('2026-10-08T15:00:00+03:00'),
        endsAt: new Date('2026-10-08T16:30:00+03:00'),
        format: 'ONLINE',
        meetingUrl: 'https://telemost.yandex.ru/example',
        calendarId: calendar.id,
        creatorId: user.id,
      },

      {
        title: 'Лекторий «Кругозор»',
        eventType: 'LECTURE',
        startsAt: new Date('2026-10-09T18:00:00+03:00'),
        endsAt: new Date('2026-10-09T19:30:00+03:00'),
        format: 'OFFLINE',
        room: '685',
        calendarId: calendar.id,
        creatorId: user.id,
      },
    ],
  });

  console.log('Seed completed');
  console.log(`User ID: ${user.id}`);
  console.log(`Calendar ID: ${calendar.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
