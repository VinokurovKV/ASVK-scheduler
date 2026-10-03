export type EventFormat = "ONLINE" | "OFFLINE";
export type EventType = "LECTURE" | "SEMINAR" | "WORK_MEETING" | "MEETING";
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
  username: string | null;
  authProvider: "STANDARD" | "ASVK";
}

export interface Event {
  id: number;
  title: string;
  description: string | null;

  startsAt: string;
  endsAt: string;

  eventType: EventType;
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

  eventType: EventType;
  format: EventFormat;
  repeatInterval: RepeatInterval;

  room?: string;
  meetingUrl?: string;

}

export interface UpdateEventInput {
  title: string;
  description: string | null;

  startsAt: string;
  endsAt: string;

  eventType: EventType;
  format: EventFormat;
  repeatInterval: RepeatInterval;

  room?: string;
  meetingUrl?: string;
}
