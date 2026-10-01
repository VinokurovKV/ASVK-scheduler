export type EventFormat = 'ONLINE' | 'OFFLINE';
export type RepeatInterval = 'NONE' | 'WEEK' | 'TWO_WEEKS' | 'MONTH';

export interface CreateEventInput {
  title: string;
  description?: string;

  startsAt: string;
  endsAt: string;

  format: EventFormat;
  repeatInterval?: RepeatInterval;

  room?: string;
  meetingUrl?: string;

  calendarId: number;
  creatorId: number;
}
