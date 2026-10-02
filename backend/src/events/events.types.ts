export type EventFormat = 'ONLINE' | 'OFFLINE';
export type EventType = 'LECTURE' | 'SEMINAR' | 'WORK_MEETING' | 'MEETING';
export type RepeatInterval = 'NONE' | 'WEEK' | 'TWO_WEEKS' | 'MONTH';

export interface CreateEventInput {
  title: string;
  description?: string;

  startsAt: string;
  endsAt: string;

  eventType?: EventType;
  format: EventFormat;
  repeatInterval?: RepeatInterval;

  room?: string;
  meetingUrl?: string;

  calendarId: number;
  creatorId: number;
}

export interface UpdateEventInput {
  title?: string;
  description?: string | null;

  startsAt?: string;
  endsAt?: string;

  eventType?: EventType;
  format?: EventFormat;
  repeatInterval?: RepeatInterval;

  room?: string;
  meetingUrl?: string;
}
