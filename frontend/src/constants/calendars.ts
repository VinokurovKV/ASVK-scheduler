import type { Calendar } from "../types/Event";

export const getCalendarLabel = (calendar: Calendar) => {
  if (calendar.type === "PERSONAL") {
    return "Личный";
  }

  if (calendar.type === "GROUP") {
    return calendar.groupNumber
      ? `Группа ${calendar.groupNumber}`
      : calendar.name;
  }

  return calendar.name;
};
