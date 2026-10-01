export type EventFormat = "ONLINE" | "OFFLINE";
export type RepeatInterval = "NONE" | "WEEK" | "TWO_WEEKS" | "MONTH";

export interface Calendar {
  id: number;
  name: string;
  type: "PERSONAL" | "GROUP" | "DEPARTMENT";
  ownerId: number;
}

export interface EventCreator {
  id: number;
  name: string;
  email: string;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;

  startsAt: string;
  endsAt: string;

  format: EventFormat;
  repeatInterval: RepeatInterval;

  room: string | null;
  meetingUrl: string | null;

  calendarId: number;
  creatorId: number;

  calendar: Calendar;
  creator: EventCreator;
}

export interface CreateEventInput {
  title: string;
  description?: string;

  startsAt: string;
  endsAt: string;

  format: EventFormat;
  repeatInterval: RepeatInterval;

  room?: string;
  meetingUrl?: string;

  calendarId: number;
  creatorId: number;
}

export interface UpdateEventInput {
  title: string;
  description: string | null;

  startsAt: string;
  endsAt: string;

  format: EventFormat;
  repeatInterval: RepeatInterval;

  room?: string;
  meetingUrl?: string;
}
