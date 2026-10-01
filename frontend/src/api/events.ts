import type { CreateEventInput, Event } from "../types/Event";

const API_URL = "http://localhost:3000";

export const getEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${API_URL}/events`);

  if (!response.ok) {
    throw new Error("Failed to load events");
  }

  return response.json();
};

export const createEvent = async (input: CreateEventInput): Promise<Event> => {
  const response = await fetch(`${API_URL}/events`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create event");
  }

  return response.json();
};
