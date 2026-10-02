import type { EventType } from "../types/Event";

export const eventTypeLabels: Record<EventType, string> = {
  LECTURE: "Лекция",
  SEMINAR: "Семинар",
  WORK_MEETING: "Совещание",
  MEETING: "Встреча",
};

interface EventTypeStyle {
  main: string;
  surface: string;
}

export const eventTypeTextColor = "#1F2937";
export const eventTypeLabelTextColor = "#F8FAFC";

export const eventTypeStyles: Record<EventType, EventTypeStyle> = {
  LECTURE: {
    main: "#3478B9",
    surface: "#D9EAF7",
  },
  SEMINAR: {
    main: "#3B7D43",
    surface: "#D8ECD9",
  },
  WORK_MEETING: {
    main: "#7255AD",
    surface: "#E2D9F1",
  },
  MEETING: {
    main: "#C96D22",
    surface: "#FADDC4",
  },
};
