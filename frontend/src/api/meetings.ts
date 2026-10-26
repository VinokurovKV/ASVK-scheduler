import type { Event } from "../types/Event";
import type { AvatarColor, UserRole } from "../types/Auth";
import type {
  EventFormat,
  RepeatInterval,
} from "../types/Event";
import { apiFetch } from "./config";

export type MeetingParticipationStatus =
  | "ORGANIZER"
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | null;

export interface MeetingParticipant {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  avatarColor: AvatarColor;
  status: "PENDING" | "ACCEPTED";
}

export interface MeetingOrganizer {
  id: number;
  name: string;
  username: string | null;
  authProvider: "STANDARD" | "ASVK";
  role: UserRole | null;
  groupNumber: string | null;
  avatarColor: AvatarColor;
}

export interface Meeting extends Omit<Event, "eventType" | "creator"> {
  eventType: "MEETING" | "WORK_MEETING";
  creator: MeetingOrganizer;
  participationStatus: MeetingParticipationStatus;
  participants: MeetingParticipant[];
}

export const MEETINGS_QUERY_KEY = ["meetings"] as const;

export const getMeetings = async (): Promise<Meeting[]> => {
  const response = await apiFetch("/meetings");

  if (!response.ok) {
    throw new Error("Failed to load meetings");
  }

  return response.json();
};

export interface CreateMeetingInput {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  eventType: "MEETING" | "WORK_MEETING";
  format: EventFormat;
  repeatInterval: RepeatInterval;
  room?: string;
  meetingUrl?: string;
  participantIds: number[];
}

export const createMeeting = async (
  input: CreateMeetingInput,
): Promise<Meeting> => {
  const response = await apiFetch("/meetings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create meeting");
  }

  return response.json();
};
