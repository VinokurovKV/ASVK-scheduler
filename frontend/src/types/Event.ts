export type EventFormat = "ONLINE" | "OFFLINE";

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

  room: string | null;
  meetingUrl: string | null;

  calendarId: number;
  creatorId: number;

  calendar: Calendar;
  creator: EventCreator;
}
