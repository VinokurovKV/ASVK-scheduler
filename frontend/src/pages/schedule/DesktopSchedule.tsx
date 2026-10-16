import {
  ChevronLeft,
  ChevronRight,
  LocationOn,
  Videocam,
} from "@mui/icons-material";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";

import type { Event } from "../../types/Event";
import {
  eventTypeStyles,
  eventTypeTextColor,
} from "../../constants/events";

import {
  addDays,
  formatTime,
  fullWeekdayNames,
  isSameDay,
} from "./scheduleUtils";

interface DesktopScheduleProps {
  events: Event[];
  weekStart: Date;
  onWeekChange: (direction: number) => void;
  onOpenDetails: (event: Event) => void;
}

const START_HOUR = 8;
const END_HOUR = 21;
const HOUR_HEIGHT = 64;

const hours = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, index) => START_HOUR + index,
);

const getEventPosition = (event: Event) => {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);

  const startMinutes = start.getHours() * 60 + start.getMinutes();

  const endMinutes = end.getHours() * 60 + end.getMinutes();

  const visibleStartMinutes = START_HOUR * 60;

  const visibleEndMinutes = END_HOUR * 60;

  const clampedStart = Math.max(startMinutes, visibleStartMinutes);

  const clampedEnd = Math.min(endMinutes, visibleEndMinutes);

  const top = ((clampedStart - visibleStartMinutes) / 60) * HOUR_HEIGHT;

  const height = ((clampedEnd - clampedStart) / 60) * HOUR_HEIGHT;

  return {
    top,
    height: Math.max(height, 28),
  };
};

export const DesktopSchedule = ({
  events,
  weekStart,
  onWeekChange,
  onOpenDetails,
}: DesktopScheduleProps) => {
  const today = new Date();

  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index),
  );

  const weekEnd = weekDays[6];

  const monthLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? new Intl.DateTimeFormat("ru-RU", {
          month: "long",
          year: "numeric",
        }).format(weekStart)
      : `${new Intl.DateTimeFormat("ru-RU", {
          month: "long",
        }).format(weekStart)} — ${new Intl.DateTimeFormat("ru-RU", {
          month: "long",
          year: "numeric",
        }).format(weekEnd)}`;

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {monthLabel}
        </Typography>

        <Stack direction="row">
          <IconButton
            onClick={() => onWeekChange(-1)}
            aria-label="Предыдущая неделя"
          >
            <ChevronLeft />
          </IconButton>

          <IconButton
            onClick={() => onWeekChange(1)}
            aria-label="Следующая неделя"
          >
            <ChevronRight />
          </IconButton>
        </Stack>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          overflow: "hidden",
          borderRadius: 3,
        }}
      >
        {/* Day headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "64px repeat(7, minmax(0, 1fr))",

            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box />

          {weekDays.map((date, index) => {
            const currentDay = isSameDay(date, today);

            return (
              <Box
                key={date.toISOString()}
                sx={{
                  py: 1.5,
                  px: 1,
                  minWidth: 0,

                  borderLeft: "1px solid",
                  borderColor: "divider",

                  backgroundColor: currentDay
                    ? "action.selected"
                    : "background.paper",

                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                  }}
                >
                  {fullWeekdayNames[index]}
                </Typography>

                <Typography
                  sx={{
                    fontWeight: currentDay ? 700 : 500,
                  }}
                >
                  {date.getDate()}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Calendar body */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "64px repeat(7, minmax(0, 1fr))",
          }}
        >
          {/* Time column */}
          <Box
            sx={{
              position: "relative",
              height: (END_HOUR - START_HOUR) * HOUR_HEIGHT,
            }}
          >
            {hours.slice(0, -1).map((hour, index) => (
              <Typography
                key={hour}
                variant="caption"
                color="text.secondary"
                sx={{
                  position: "absolute",
                  top: index * HOUR_HEIGHT - 8,
                  right: 10,
                }}
              >
                {String(hour).padStart(2, "0")}
                :00
              </Typography>
            ))}
          </Box>

          {/* Days */}
          {weekDays.map((date) => {
            const dayEvents = events.filter((event) =>
              isSameDay(new Date(event.startsAt), date),
            );

            return (
              <Box
                key={date.toISOString()}
                sx={{
                  position: "relative",

                  height: (END_HOUR - START_HOUR) * HOUR_HEIGHT,

                  minWidth: 0,

                  borderLeft: "1px solid",
                  borderColor: "divider",

                  backgroundColor: isSameDay(date, today)
                    ? "action.hover"
                    : "background.paper",
                }}
              >
                {/* Hour lines */}
                {hours.slice(0, -1).map((hour, index) => (
                  <Box
                    key={hour}
                    sx={{
                      position: "absolute",
                      top: index * HOUR_HEIGHT,
                      left: 0,
                      right: 0,

                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const { top, height } = getEventPosition(event);
                  const durationMinutes = Math.round(
                    (new Date(event.endsAt).getTime() -
                      new Date(event.startsAt).getTime()) /
                      (60 * 1000),
                  );
                  const timeLabel = `${formatTime(event.startsAt)}–${formatTime(event.endsAt)}`;
                  const locationLabel =
                    event.format === "ONLINE"
                      ? "Онлайн"
                      : event.room
                        ? `Аудитория ${event.room}`
                        : "Очно";

                  return (
                    <Box
                      key={event.id}
                      component="button"
                      type="button"
                      aria-label={`Открыть событие «${event.title}»`}
                      onClick={() => onOpenDetails(event)}
                      sx={{
                        position: "absolute",

                        top,
                        left: 4,
                        right: 4,
                        height,

                        p: durationMinutes <= 30 ? 0.5 : 0.75,

                        borderRadius: 2,
                        borderTop: 0,
                        borderRight: 0,
                        borderBottom: 0,

                        overflow: "hidden",

                        backgroundColor:
                          eventTypeStyles[event.eventType].surface,

                        borderLeft: 4,
                        borderLeftColor: eventTypeStyles[event.eventType].main,

                        color: eventTypeTextColor,

                        boxShadow: 1,

                        zIndex: 1,
                        textAlign: "left",
                        cursor: "pointer",
                        font: "inherit",
                        transition: "filter 150ms ease, transform 150ms ease",
                        "&:hover": {
                          filter: "brightness(0.97)",
                          transform: "translateX(2px)",
                        },
                        "&:focus-visible": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: 2,
                        },
                      }}
                    >
                      {durationMinutes <= 30 ? (
                        <Typography
                          sx={{
                            overflow: "hidden",
                            fontSize: "0.68rem",
                            lineHeight: 1.25,
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Box component="span" sx={{ fontWeight: 600 }}>
                            {timeLabel} · {event.title} ·{" "}
                          </Box>
                          {locationLabel}
                        </Typography>
                      ) : durationMinutes <= 60 ? (
                        <>
                          <Typography
                            sx={{
                              overflow: "hidden",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              lineHeight: 1.2,
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {timeLabel} · {event.title}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.25,
                              overflow: "hidden",
                              fontSize: "0.68rem",
                              lineHeight: 1.2,
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {locationLabel}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography
                            sx={{
                              overflow: "hidden",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              lineHeight: 1.15,
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {timeLabel}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.2,
                              overflow: "hidden",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              lineHeight: 1.15,
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {event.title}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ mt: 0.2, alignItems: "center" }}
                          >
                            {event.format === "ONLINE" ? (
                              <Videocam sx={{ fontSize: 14 }} />
                            ) : (
                              <LocationOn sx={{ fontSize: 14 }} />
                            )}
                            <Typography
                              sx={{
                                overflow: "hidden",
                                fontSize: "0.68rem",
                                lineHeight: 1.15,
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {locationLabel}
                            </Typography>
                          </Stack>
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Stack>
  );
};
