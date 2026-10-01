import {
  ChevronLeft,
  ChevronRight,
  LocationOn,
  Videocam,
} from "@mui/icons-material";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";

import type { Event } from "../../types/Event";

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

                  return (
                    <Box
                      key={event.id}
                      sx={{
                        position: "absolute",

                        top,
                        left: 4,
                        right: 4,
                        height,

                        p: 1,

                        borderRadius: 2,

                        overflow: "hidden",

                        backgroundColor: "primary.main",

                        color: "primary.contrastText",

                        boxShadow: 1,

                        zIndex: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.78rem",
                          lineHeight: 1.2,

                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.title}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: "0.7rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {formatTime(event.startsAt)}
                        {"–"}
                        {formatTime(event.endsAt)}
                      </Typography>

                      {height >= 55 && (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{
                            mt: 0.5,
                            alignItems: "center",
                          }}
                        >
                          {event.format === "ONLINE" ? (
                            <Videocam
                              sx={{
                                fontSize: 14,
                              }}
                            />
                          ) : (
                            <LocationOn
                              sx={{
                                fontSize: 14,
                              }}
                            />
                          )}

                          <Typography
                            sx={{
                              fontSize: "0.68rem",

                              overflow: "hidden",

                              textOverflow: "ellipsis",

                              whiteSpace: "nowrap",
                            }}
                          >
                            {event.format === "ONLINE" ? "Онлайн" : event.room}
                          </Typography>
                        </Stack>
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
