import type { Calendar } from "../types/Event";
import { apiFetch } from "./config";

export const CALENDARS_QUERY_KEY = ["calendars"] as const;

export const getCalendars = async (): Promise<Calendar[]> => {
  const response = await apiFetch("/calendars");

  if (!response.ok) {
    throw new Error("Failed to load calendars");
  }

  return response.json();
};
