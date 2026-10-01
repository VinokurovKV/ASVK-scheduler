export const startOfWeek = (date: Date) => {
  const result = new Date(date);

  const day = result.getDay();
  const distanceToMonday = day === 0 ? 6 : day - 1;

  result.setDate(result.getDate() - distanceToMonday);
  result.setHours(0, 0, 0, 0);

  return result;
};

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
};

const atStartOfDay = (date: Date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

const daysBetween = (first: Date, second: Date) => {
  return Math.round(
    (atStartOfDay(first).getTime() - atStartOfDay(second).getTime()) /
      (24 * 60 * 60 * 1000),
  );
};

const createOccurrence = (event: Event, date: Date): Event => {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);

  const occurrenceStart = new Date(date);
  occurrenceStart.setHours(
    start.getHours(),
    start.getMinutes(),
    start.getSeconds(),
    start.getMilliseconds(),
  );

  const occurrenceEnd = new Date(
    occurrenceStart.getTime() + (end.getTime() - start.getTime()),
  );

  return {
    ...event,
    startsAt: occurrenceStart.toISOString(),
    endsAt: occurrenceEnd.toISOString(),
  };
};

const repeatsOnDate = (event: Event, date: Date) => {
  const start = new Date(event.startsAt);
  const difference = daysBetween(date, start);

  if (difference < 0) {
    return false;
  }

  if (event.repeatInterval === "NONE") {
    return difference === 0;
  }

  if (event.repeatInterval === "WEEK") {
    return difference % 7 === 0;
  }

  if (event.repeatInterval === "TWO_WEEKS") {
    return difference % 14 === 0;
  }

  return date.getDate() === start.getDate();
};

export const getEventsForWeek = (events: Event[], weekStart: Date) => {
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index),
  );

  return events.flatMap((event) =>
    weekDays
      .filter((date) => repeatsOnDate(event, date))
      .map((date) => createOccurrence(event, date)),
  );
};

export const isSameDay = (first: Date, second: Date) => {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

export const formatTime = (date: string) => {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formatSelectedDate = (date: Date) => {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
};

export const formatMonth = (date: Date) => {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const weekdayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const fullWeekdayNames = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];
import type { Event } from "../../types/Event";
