import {
  ChevronLeft,
  ChevronRight,
  LocationOn,
  Videocam,
} from "@mui/icons-material";

import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import type { Event } from "../../types/Event";
import {
  eventTypeLabels,
  eventTypeLabelTextColor,
  eventTypeStyles,
} from "../../constants/events";

import {
  addDays,
  formatMonth,
  formatSelectedDate,
  formatTime,
  isSameDay,
  weekdayNames,
} from "./scheduleUtils";

interface MobileScheduleProps {
  events: Event[];
  weekStart: Date;
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  onWeekChange: (direction: number) => void;
}

const EventPlace = ({ event }: { event: Event }) => {
  if (event.format === "ONLINE") {
    return (
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          alignItems: "center",
        }}
      >
        <Videocam fontSize="small" color="action" />

        <Typography variant="body2" color="text.secondary">
          Онлайн
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        alignItems: "center",
      }}
    >
      <LocationOn fontSize="small" color="action" />

      <Typography variant="body2" color="text.secondary">
        Аудитория {event.room}
      </Typography>
    </Stack>
  );
};

export const MobileSchedule = ({
  events,
  weekStart,
  selectedDate,
  onSelectedDateChange,
  onWeekChange,
}: MobileScheduleProps) => {
  const today = new Date();

  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index),
  );

  const selectedEvents = events
    .filter((event) => isSameDay(new Date(event.startsAt), selectedDate))
    .sort(
      (first, second) =>
        new Date(first.startsAt).getTime() -
        new Date(second.startsAt).getTime(),
    );

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <IconButton
          onClick={() => onWeekChange(-1)}
          aria-label="Предыдущая неделя"
        >
          <ChevronLeft />
        </IconButton>

        <Typography
          sx={{
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {formatMonth(selectedDate)}
        </Typography>

        <IconButton
          onClick={() => onWeekChange(1)}
          aria-label="Следующая неделя"
        >
          <ChevronRight />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={0.5}>
        {weekDays.map((date, index) => {
          const selected = isSameDay(date, selectedDate);

          const isToday = isSameDay(date, today);

          const dayEvents = events.filter((event) =>
            isSameDay(new Date(event.startsAt), date),
          );

          return (
            <Box
              key={date.toISOString()}
              onClick={() => onSelectedDateChange(date)}
              sx={{
                flex: 1,
                minWidth: 0,
                py: 1,
                borderRadius: 2,
                textAlign: "center",
                cursor: "pointer",

                backgroundColor: selected ? "primary.main" : "transparent",

                color: selected ? "primary.contrastText" : "text.primary",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",

                  color: selected ? "inherit" : "text.secondary",
                }}
              >
                {weekdayNames[index]}
              </Typography>

              <Typography
                sx={{
                  fontWeight: selected || isToday ? 700 : 400,
                }}
              >
                {date.getDate()}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 0.25,
                  minHeight: 4,
                  mt: 0.5,
                }}
              >
                {dayEvents.map((event) => (
                  <Box
                    key={`${event.id}-${event.startsAt}`}
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor: eventTypeStyles[event.eventType].main,
                      boxShadow: selected
                        ? (theme) =>
                            `0 0 0 1px ${theme.palette.app.overlay.whiteStrong}`
                        : "none",
                    }}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Stack>

      <Box>
        <Typography
          variant="h6"
          sx={{
            mb: 1.5,
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {formatSelectedDate(selectedDate)}
        </Typography>

        {selectedEvents.length === 0 ? (
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                color="text.secondary"
                sx={{
                  py: 3,
                  textAlign: "center",
                }}
              >
                На этот день событий нет
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {selectedEvents.map((event) => (
              <Card
                key={event.id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderLeftWidth: 4,
                  borderLeftColor: eventTypeStyles[event.eventType].main,
                  backgroundColor: eventTypeStyles[event.eventType].surface,
                }}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                          }}
                        >
                          {event.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.25,
                          }}
                        >
                          {formatTime(event.startsAt)}
                          {"–"}
                          {formatTime(event.endsAt)}
                        </Typography>
                      </Box>

                      <Chip
                        label={eventTypeLabels[event.eventType]}
                        size="small"
                        sx={{
                          backgroundColor: eventTypeStyles[event.eventType].main,
                          color: eventTypeLabelTextColor,
                          fontWeight: 600,
                        }}
                      />
                    </Stack>

                    <EventPlace event={event} />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};
