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

export const eventTypeTextColor = "app.text.event";
export const eventTypeLabelTextColor = "app.text.onDark";

export const eventTypeStyles: Record<EventType, EventTypeStyle> = {
  LECTURE: {
    main: "app.event.lecture.main",
    surface: "app.event.lecture.surface",
  },
  SEMINAR: {
    main: "app.event.seminar.main",
    surface: "app.event.seminar.surface",
  },
  WORK_MEETING: {
    main: "app.event.workMeeting.main",
    surface: "app.event.workMeeting.surface",
  },
  MEETING: {
    main: "app.event.meeting.main",
    surface: "app.event.meeting.surface",
  },
};
