import type { PrismaService } from '../prisma.service.js';
import {
  type AccessibleCalendar,
  type CalendarAccessUser,
  CalendarsService,
} from './calendars.service.js';

const personalCalendar: AccessibleCalendar = {
  id: 1,
  name: 'Мой календарь',
  type: 'PERSONAL',
  groupNumber: null,
  ownerId: 10,
};

const groupCalendar: AccessibleCalendar = {
  id: 2,
  name: 'Группа 421',
  type: 'GROUP',
  groupNumber: '421',
  ownerId: null,
};

const createUser = (
  overrides: Partial<CalendarAccessUser> = {},
): CalendarAccessUser => ({
  id: 10,
  groupNumber: '421',
  appRoles: [],
  ...overrides,
});

describe('CalendarsService permissions', () => {
  const service = new CalendarsService({} as PrismaService);

  it('allows a user to manage only their own personal calendar', () => {
    const user = createUser();

    expect(service.canView(user, personalCalendar)).toBe(true);
    expect(service.canManage(user, personalCalendar)).toBe(true);
    expect(service.canView({ ...user, id: 11 }, personalCalendar)).toBe(false);
  });

  it('allows a member to view but not manage their group calendar', () => {
    const user = createUser();

    expect(service.canView(user, groupCalendar)).toBe(true);
    expect(service.canManage(user, groupCalendar)).toBe(false);
  });

  it('allows a group leader to manage only their own group calendar', () => {
    const leader = createUser({ appRoles: ['GROUP_LEADER'] });

    expect(service.canManage(leader, groupCalendar)).toBe(true);
    expect(
      service.canManage(leader, { ...groupCalendar, groupNumber: '321' }),
    ).toBe(false);
  });

  it('allows the owner to manage any shared calendar', () => {
    const owner = createUser({ groupNumber: null, appRoles: ['OWNER'] });

    expect(service.canView(owner, groupCalendar)).toBe(true);
    expect(service.canManage(owner, groupCalendar)).toBe(true);
  });
});
