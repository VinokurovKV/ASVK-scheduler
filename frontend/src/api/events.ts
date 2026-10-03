import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from "../types/Event";
import { apiFetch } from "./config";

export const getEvents = async (): Promise<Event[]> => {
  const response = await apiFetch("/events");

  if (!response.ok) {
    throw new Error("Failed to load events");
  }

  return response.json();
};

export const createEvent = async (input: CreateEventInput): Promise<Event> => {
  const response = await apiFetch("/events", {
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

export const deleteEvent = async (id: number): Promise<void> => {
  const response = await apiFetch(`/events/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete event");
  }
};

export const updateEvent = async (
  id: number,
  input: UpdateEventInput,
): Promise<Event> => {
  const response = await apiFetch(`/events/${id}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to update event");
  }

  return response.json();
};
