import type { EventType } from "../types/Event";
import { appColors } from "../theme/colors";

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

export const eventTypeTextColor = appColors.text.event;
export const eventTypeLabelTextColor = appColors.text.onDark;

export const eventTypeStyles: Record<EventType, EventTypeStyle> = {
  LECTURE: {
    main: appColors.event.lecture.main,
    surface: appColors.event.lecture.surface,
  },
  SEMINAR: {
    main: appColors.event.seminar.main,
    surface: appColors.event.seminar.surface,
  },
  WORK_MEETING: {
    main: appColors.event.workMeeting.main,
    surface: appColors.event.workMeeting.surface,
  },
  MEETING: {
    main: appColors.event.meeting.main,
    surface: appColors.event.meeting.surface,
  },
};
