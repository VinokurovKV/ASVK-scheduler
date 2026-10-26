import type { Event } from "../types/Event";
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
  status: "PENDING" | "ACCEPTED";
}

export interface Meeting extends Omit<Event, "eventType"> {
  eventType: "MEETING" | "WORK_MEETING";
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
