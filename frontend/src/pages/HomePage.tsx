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

import { getEvents } from "../api/events";
import type { Event } from "../types/Event";

const isSameDay = (first: Date, second: Date) => {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

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

  const nextEvent = events.find((event) => new Date(event.startsAt) >= now);

  const todayEvents = events.filter((event) =>
    isSameDay(new Date(event.startsAt), now),
  );

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
                      label={nextEvent.format === "ONLINE" ? "Онлайн" : "Очно"}
                      size="small"
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
                  >
                    Присоединиться
                  </Button>
                ) : (
                  <Button variant="contained" fullWidth>
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
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {event.title}
                    </Typography>

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
    </Stack>
  );
};
