import { AccessTime, LocationOn, Videocam } from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getEvents } from "../api/events";
import { EventDetailsDialog } from "../components/events/EventDetailsDialog";
import {
  eventTypeLabels,
  eventTypeLabelTextColor,
  eventTypeStyles,
} from "../constants/events";
import {
  getEventsForDate,
  getNextEventOccurrence,
} from "./schedule/scheduleUtils";
import type { Event } from "../types/Event";

const formatTime = (date: string) => {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatEventDate = (date: string) => {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(date));
};

const EventLocation = ({ event }: { event: Event }) => {
  if (event.format === "ONLINE") {
    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <Videocam fontSize="small" color="action" />

        <Typography variant="body2">Онлайн</Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
      }}
    >
      <LocationOn fontSize="small" color="action" />

      <Typography variant="body2">Аудитория {event.room}</Typography>
    </Stack>
  );
};

export const HomePage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const now = new Date();

  const currentDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(now);

  const nextEvent = getNextEventOccurrence(events, now);

  const todayEvents = getEventsForDate(events, now);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Не удалось загрузить события</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,

            fontSize: {
              xs: "1.75rem",
              md: "2.125rem",
            },
          }}
        >
          Сегодня
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
            textTransform: "capitalize",
          }}
        >
          {currentDate}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="h6"
          sx={{
            mb: 1.5,
            fontWeight: 600,
          }}
        >
          Следующее событие
        </Typography>

        {nextEvent ? (
          <Card
            variant="outlined"
            sx={{
              bgcolor: eventTypeStyles[nextEvent.eventType].surface,
              borderLeft: 4,
              borderLeftColor: eventTypeStyles[nextEvent.eventType].main,
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {nextEvent.title}
                    </Typography>

                    <Chip
                      label={eventTypeLabels[nextEvent.eventType]}
                      size="small"
                      sx={{
                        bgcolor: eventTypeStyles[nextEvent.eventType].main,
                        color: eventTypeLabelTextColor,
                      }}
                    />
                  </Stack>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    {formatEventDate(nextEvent.startsAt)}
                  </Typography>
                </Box>

                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    <AccessTime fontSize="small" color="action" />

                    <Typography variant="body2">
                      {formatTime(nextEvent.startsAt)}
                      {"–"}
                      {formatTime(nextEvent.endsAt)}
                    </Typography>
                  </Stack>

                  <EventLocation event={nextEvent} />
                </Stack>

                {nextEvent.format === "ONLINE" && nextEvent.meetingUrl ? (
                  <Button
                    variant="contained"
                    fullWidth
                    href={nextEvent.meetingUrl}
                    target="_blank"
                    sx={{
                      bgcolor: eventTypeStyles[nextEvent.eventType].main,
                      color: eventTypeLabelTextColor,
                      "&:hover": {
                        bgcolor: eventTypeStyles[nextEvent.eventType].main,
                        filter: "brightness(0.9)",
                      },
                    }}
                  >
                    Присоединиться
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setSelectedEvent(nextEvent)}
                    sx={{
                      bgcolor: eventTypeStyles[nextEvent.eventType].main,
                      color: eventTypeLabelTextColor,
                      "&:hover": {
                        bgcolor: eventTypeStyles[nextEvent.eventType].main,
                        filter: "brightness(0.9)",
                      },
                    }}
                  >
                    Подробнее
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ) : (
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
                Ближайших событий нет
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      <Box>
        <Typography
          variant="h6"
          sx={{
            mb: 1.5,
            fontWeight: 600,
          }}
        >
          События сегодня
        </Typography>

        {todayEvents.length === 0 ? (
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
                На сегодня событий нет
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {todayEvents.map((event) => (
              <Card
                key={event.id}
                variant="outlined"
                sx={{
                  bgcolor: eventTypeStyles[event.eventType].surface,
                  borderLeft: 4,
                  borderLeftColor: eventTypeStyles[event.eventType].main,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {event.title}
                      </Typography>

                      <Chip
                        label={eventTypeLabels[event.eventType]}
                        size="small"
                        sx={{
                          bgcolor: eventTypeStyles[event.eventType].main,
                          color: eventTypeLabelTextColor,
                          flexShrink: 0,
                        }}
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {formatTime(event.startsAt)}
                      {"–"}
                      {formatTime(event.endsAt)}
                    </Typography>

                    <EventLocation event={event} />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEventUpdated={setSelectedEvent}
        />
      )}
    </Stack>
  );
};
