export type EventFormat = 'ONLINE' | 'OFFLINE';

export interface CreateEventInput {
  title: string;
  description?: string;

  startsAt: string;
  endsAt: string;

  format: EventFormat;

  room?: string;
  meetingUrl?: string;

  calendarId: number;
  creatorId: number;
}
