export type EventFormat = "ONLINE" | "OFFLINE";
export type EventType = "LECTURE" | "SEMINAR" | "WORK_MEETING" | "MEETING";
export type RepeatInterval = "NONE" | "WEEK" | "TWO_WEEKS" | "MONTH";

export interface Calendar {
  id: number;
  name: string;
  type: "PERSONAL" | "GROUP" | "DEPARTMENT";
  groupNumber: string | null;
  ownerId: number | null;
  canManage?: boolean;
}

export interface EventCreator {
  id: number;
  name: string;
  username: string | null;
  authProvider: "STANDARD" | "ASVK";
}

export interface EventParticipantSummary {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  status: "PENDING" | "ACCEPTED";
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
  teacherName: string | null;

  calendarId: number;
  creatorId: number;

  calendar: Calendar;
  creator: EventCreator;
  participants?: EventParticipantSummary[];
  canEdit: boolean;
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
  teacherName?: string | null;
  calendarId?: number;
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
  teacherName?: string | null;
}
