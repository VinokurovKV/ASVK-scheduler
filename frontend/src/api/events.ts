import type { Event } from "../types/Event";

const API_URL = "http://localhost:3000";

export const getEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${API_URL}/events`);

  if (!response.ok) {
    throw new Error("Failed to load events");
  }

  return response.json();
};
