import {
  AccessTime,
  BarChartRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  EventAvailableRounded,
  GroupsRounded,
  LaptopMacRounded,
  LocationOn,
  MenuBookRounded,
  Videocam,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { getEvents } from "../api/events";
import { EventDetailsDialog } from "../components/events/EventDetailsDialog";
import { eventTypeStyles } from "../constants/events";
import {
  getEventsForDate,
  getNextEventOccurrence,
  isSameDay,
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

interface TimeInterval {
  startsAt: Date;
  endsAt: Date;
}

interface FreeWindow extends TimeInterval {
  startedBeforeCurrentTime: boolean;
}

const getNearestFreeWindow = (
  events: Event[],
  currentTime: Date,
): FreeWindow | null => {
  const currentMinute = new Date(currentTime);
  currentMinute.setSeconds(0, 0);

  const dayStart = new Date(currentTime);
  dayStart.setHours(8, 0, 0, 0);

  const dayEnd = new Date(currentTime);
  dayEnd.setHours(22, 0, 0, 0);

  const occupiedIntervals = events
    .map((event) => ({
      startsAt: new Date(
        Math.max(new Date(event.startsAt).getTime(), dayStart.getTime()),
      ),
      endsAt: new Date(
        Math.min(new Date(event.endsAt).getTime(), dayEnd.getTime()),
      ),
    }))
    .filter((interval) => interval.endsAt > interval.startsAt)
    .sort(
      (first, second) => first.startsAt.getTime() - second.startsAt.getTime(),
    );

  const freeWindows: TimeInterval[] = [];
  let freeWindowStart = dayStart;

  occupiedIntervals.forEach((interval) => {
    if (interval.startsAt > freeWindowStart) {
      freeWindows.push({
        startsAt: freeWindowStart,
        endsAt: interval.startsAt,
      });
    }

    if (interval.endsAt > freeWindowStart) {
      freeWindowStart = interval.endsAt;
    }
  });

  if (freeWindowStart < dayEnd) {
    freeWindows.push({
      startsAt: freeWindowStart,
      endsAt: dayEnd,
    });
  }

  const minimumWindowDuration = 60 * 60 * 1000;

  for (const window of freeWindows) {
    const startsAt = new Date(
      Math.max(window.startsAt.getTime(), currentMinute.getTime()),
    );

    if (window.endsAt.getTime() - startsAt.getTime() < minimumWindowDuration) {
      continue;
    }

    return {
      startsAt,
      endsAt: window.endsAt,
      startedBeforeCurrentTime: window.startsAt < currentMinute,
    };
  }

  return null;
};

const formatDuration = (startsAt: Date, endsAt: Date) => {
  const totalMinutes = Math.round(
    (endsAt.getTime() - startsAt.getTime()) / (60 * 1000),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return [
    hours > 0 ? `${hours} ч` : null,
    minutes > 0 ? `${minutes} мин` : null,
  ]
    .filter(Boolean)
    .join(" ");
};

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 22;
const DAY_DURATION_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;
const TIMELINE_HOUR_HEIGHT = 56;

const getMinutesFromDayStart = (date: Date) => {
  return (date.getHours() - DAY_START_HOUR) * 60 + date.getMinutes();
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

interface NextEventCardProps {
  event?: Event;
  onOpenDetails: (event: Event) => void;
}

const NextEventCard = ({ event, onOpenDetails }: NextEventCardProps) => {
  const eventIsToday = event
    ? isSameDay(new Date(event.startsAt), new Date())
    : false;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: (theme) => theme.appShadows.button,
      }}
    >
      <CardContent
        sx={{
          p: 1.5,
          height: "100%",
          boxSizing: "border-box",
          "&:last-child": {
            pb: 1.5,
          },
        }}
      >
        <Stack spacing={1.25} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            sx={{
              minHeight: 32,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Ближайшее событие
            </Typography>

            {event && (
              <IconButton
                size="small"
                aria-label="Открыть ближайшее событие"
                onClick={() => onOpenDetails(event)}
              >
                <ChevronRightRounded />
              </IconButton>
            )}
          </Stack>

          {event ? (
            <Box
              sx={{
                overflow: "hidden",
                flex: 1,
                borderRadius: 3.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                p: 1.5,
              }}
            >
              <Stack
                spacing={1.5}
                sx={{
                  height: "100%",
                  justifyContent:
                    event.format === "ONLINE" ? "space-between" : "center",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontFamily: (theme) =>
                          theme.typography.caption.fontFamily,
                        fontWeight: 500,
                      }}
                    >
                      {!eventIsToday && `${formatEventDate(event.startsAt)} · `}
                      {formatTime(event.startsAt)}
                      {" – "}
                      {formatTime(event.endsAt)}
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        mt: 0.25,
                        overflow: "hidden",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {event.title}
                    </Typography>

                    <Box sx={{ mt: 0.75 }}>
                      <EventLocation event={event} />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      width: 68,
                      height: 68,
                      flexShrink: 0,
                      placeItems: "center",
                      borderRadius: "50%",
                      bgcolor: "background.paper",
                      color: "primary.main",
                      opacity: 0.72,
                    }}
                  >
                    {event.format === "ONLINE" ? (
                      <LaptopMacRounded sx={{ fontSize: 38 }} />
                    ) : (
                      <LocationOn sx={{ fontSize: 38 }} />
                    )}
                  </Box>
                </Stack>

                {event.format === "ONLINE" &&
                  (event.meetingUrl ? (
                    <Button
                      variant="contained"
                      fullWidth
                      href={event.meetingUrl}
                      target="_blank"
                      endIcon={<ChevronRightRounded />}
                      sx={{ borderRadius: 3 }}
                    >
                      Перейти к встрече
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      endIcon={<ChevronRightRounded />}
                      onClick={() => onOpenDetails(event)}
                      sx={{ borderRadius: 3 }}
                    >
                      Подробнее
                    </Button>
                  ))}
              </Stack>
            </Box>
          ) : (
            <Typography
              color="text.secondary"
              sx={{
                py: 3,
                textAlign: "center",
              }}
            >
              Ближайших событий нет
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const DaySummaryCard = ({ events }: { events: Event[] }) => {
  const meetingsCount = events.filter(
    (event) => event.eventType === "MEETING",
  ).length;

  const firstEvent = events[0];
  const lastEvent = events.at(-1);

  const summaryItems = [
    {
      icon: <MenuBookRounded />,
      value: events.length.toString(),
      label: "События",
    },
    {
      icon: <GroupsRounded />,
      value: meetingsCount.toString(),
      label: "Встречи",
    },
    {
      icon: <AccessTime />,
      value: firstEvent ? formatTime(firstEvent.startsAt) : "—",
      label: "Начало первого события",
    },
    {
      icon: <AccessTime />,
      value: lastEvent ? formatTime(lastEvent.endsAt) : "—",
      label: "Конец последнего события",
    },
  ];

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: (theme) => theme.appShadows.button,
      }}
    >
      <CardContent
        sx={{
          p: 1.5,
          height: "100%",
          boxSizing: "border-box",
          "&:last-child": {
            pb: 1.5,
          },
        }}
      >
        <Stack spacing={1.25} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              minHeight: 32,
              alignItems: "center",
            }}
          >
            <BarChartRounded color="primary" />

            <Typography
              variant="h6"
              sx={{
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Кратко о дне
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              overflow: "hidden",
              flex: 1,
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.divider, 0.1),
              borderRadius: 2.5,
            }}
          >
            {summaryItems.map((item, index) => (
              <Stack
                key={item.label}
                direction="row"
                spacing={1}
                sx={{
                  minWidth: 0,
                  minHeight: 76,
                  alignItems: "center",
                  p: 1.25,
                  borderRight: index % 2 === 0 ? "1px solid" : 0,
                  borderBottom: index < 2 ? "1px solid" : 0,
                  borderColor: (theme) => alpha(theme.palette.divider, 0.1),
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    placeItems: "center",
                    color: "primary.main",
                    "& svg": {
                      fontSize: 24,
                    },
                  }}
                >
                  {item.icon}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      lineHeight: 1.15,
                    }}
                  >
                    {item.value}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 0.25,
                      lineHeight: 1.15,
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

interface FreeWindowCardProps {
  window: FreeWindow | null;
  showDate?: boolean;
}

const FreeWindowCard = ({ window, showDate = false }: FreeWindowCardProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: (theme) => theme.appShadows.button,
      }}
    >
      <CardContent
        sx={{
          p: 1.5,
          height: "100%",
          boxSizing: "border-box",
          "&:last-child": {
            pb: 1.5,
          },
        }}
      >
        <Stack spacing={1.25} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              minHeight: 32,
              alignItems: "center",
            }}
          >
            <EventAvailableRounded
              sx={{
                color: "app.status.success.text",
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              Ближайшее свободное окно
            </Typography>
          </Stack>

          {window ? (
            <Box
              sx={{
                borderRadius: 2.5,
                bgcolor: "app.status.success.surface",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                p: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                }}
              >
                {showDate &&
                  `${formatEventDate(window.startsAt.toISOString())} · `}
                {window.startedBeforeCurrentTime
                  ? `До ${formatTime(window.endsAt.toISOString())}`
                  : `${formatTime(window.startsAt.toISOString())} – ${formatTime(window.endsAt.toISOString())}`}
              </Typography>

              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  mt: 0.5,
                  alignItems: "center",
                  color: "text.secondary",
                }}
              >
                <AccessTime sx={{ fontSize: 18 }} />

                <Typography variant="caption">
                  {formatDuration(window.startsAt, window.endsAt)}
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Typography
              color="text.secondary"
              sx={{
                py: 2,
                textAlign: "center",
              }}
            >
              Свободных окон продолжительностью от часа нет
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

interface DayTimelineProps {
  events: Event[];
  date: Date;
  onOpenDetails: (event: Event) => void;
  onDateChange: (date: Date) => void;
}

const DayTimeline = ({
  events,
  date,
  onOpenDetails,
  onDateChange,
}: DayTimelineProps) => {
  const timelineViewportRef = useRef<HTMLDivElement>(null);
  const hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
    (_, index) => DAY_START_HOUR + index,
  );

  const currentTime = new Date();
  const currentTimeOffset = getMinutesFromDayStart(currentTime);
  const showCurrentTime =
    isSameDay(date, currentTime) &&
    currentTimeOffset >= 0 &&
    currentTimeOffset <= DAY_DURATION_MINUTES;

  const dateLabel = isSameDay(date, currentTime)
    ? "Сегодня"
    : new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short",
      }).format(date);

  useEffect(() => {
    if (timelineViewportRef.current) {
      timelineViewportRef.current.scrollTop = TIMELINE_HOUR_HEIGHT;
    }
  }, [date]);

  const changeDate = (days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    onDateChange(nextDate);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        minHeight: 640,
        borderRadius: 3,
        boxShadow: (theme) => theme.appShadows.button,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          height: "100%",
          minHeight: 640,
          boxSizing: "border-box",
          flexDirection: "column",
          p: 2.5,
          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Stack
          direction="row"
          sx={{
            minHeight: 40,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 750 }}>
            Мой день
          </Typography>

          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <IconButton
              size="small"
              aria-label="Предыдущий день"
              onClick={() => changeDate(-1)}
              sx={{
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <ChevronLeftRounded />
            </IconButton>

            <Box
              sx={{
                minWidth: 82,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                px: 1.5,
                py: 0.75,
                textAlign: "center",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {dateLabel}
              </Typography>
            </Box>

            <IconButton
              size="small"
              aria-label="Следующий день"
              onClick={() => changeDate(1)}
              sx={{
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <ChevronRightRounded />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          ref={timelineViewportRef}
          sx={{
            flex: 1,
            minHeight: 0,
            mt: 1.5,
            overflowY: "auto",
            pr: 0.5,
            scrollbarColor: (theme) => `${theme.palette.divider} transparent`,
          }}
        >
          <Box
            sx={{
              position: "relative",
              height: (DAY_END_HOUR - DAY_START_HOUR) * TIMELINE_HOUR_HEIGHT,
              mt: 1,
              mb: 1,
              ml: 6.5,
              borderLeft: "1px solid",
              borderColor: "divider",
            }}
          >
            {hours.map((hour, index) => (
              <Box
                key={hour}
                sx={{
                  position: "absolute",
                  top: index * TIMELINE_HOUR_HEIGHT,
                  right: 0,
                  left: 0,
                  borderTop: index === 0 ? 0 : "1px solid",
                  borderColor: "divider",
                }}
              >
                {(!showCurrentTime ||
                  Math.abs((hour - DAY_START_HOUR) * 60 - currentTimeOffset) >
                    15) && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: "calc(100% + 12px)",
                      width: 46,
                      textAlign: "right",
                      transform: "translateY(-50%)",
                    }}
                  >
                    {`${hour.toString().padStart(2, "0")}:00`}
                  </Typography>
                )}
              </Box>
            ))}

            {events.map((event) => {
              const startsAt = new Date(event.startsAt);
              const endsAt = new Date(event.endsAt);
              const durationMinutes = Math.round(
                (endsAt.getTime() - startsAt.getTime()) / (60 * 1000),
              );
              const startsAfterDayStart = Math.max(
                0,
                getMinutesFromDayStart(startsAt),
              );
              const endsBeforeDayEnd = Math.min(
                DAY_DURATION_MINUTES,
                getMinutesFromDayStart(endsAt),
              );

              if (endsBeforeDayEnd <= startsAfterDayStart) {
                return null;
              }

              const top = (startsAfterDayStart / DAY_DURATION_MINUTES) * 100;
              const height =
                ((endsBeforeDayEnd - startsAfterDayStart) /
                  DAY_DURATION_MINUTES) *
                100;
              const eventStyle = eventTypeStyles[event.eventType];
              const timeLabel = `${formatTime(event.startsAt)} – ${formatTime(event.endsAt)}`;
              const locationLabel =
                event.format === "ONLINE"
                  ? "Онлайн"
                  : event.room
                    ? `Аудитория ${event.room}`
                    : "Очно";

              return (
                <Box
                  key={`${event.id}-${event.startsAt}`}
                  component="button"
                  type="button"
                  onClick={() => onOpenDetails(event)}
                  sx={{
                    position: "absolute",
                    top: `${top}%`,
                    right: 0,
                    left: 12,
                    zIndex: 1,
                    height: `${height}%`,
                    minHeight: durationMinutes <= 30 ? 28 : 40,
                    overflow: "hidden",
                    boxSizing: "border-box",
                    border: 0,
                    borderLeft: "5px solid",
                    borderLeftColor: eventStyle.main,
                    borderRadius: 2.5,
                    bgcolor: eventStyle.surface,
                    color: "text.primary",
                    p: durationMinutes <= 30 ? 0.5 : 0.625,
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
                      variant="caption"
                      sx={{
                        display: "block",
                        overflow: "hidden",
                        lineHeight: 1.35,
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
                        variant="caption"
                        sx={{
                          display: "block",
                          overflow: "hidden",
                          fontWeight: 600,
                          lineHeight: 1.2,
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {timeLabel} · {event.title}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mt: 0.25,
                          overflow: "hidden",
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
                        variant="caption"
                        sx={{
                          display: "block",
                          overflow: "hidden",
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
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          lineHeight: 1.15,
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.title}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mt: 0.2,
                          overflow: "hidden",
                          lineHeight: 1.15,
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {locationLabel}
                      </Typography>
                    </>
                  )}
                </Box>
              );
            })}

            {showCurrentTime && (
              <Box
                sx={{
                  position: "absolute",
                  top: `${(currentTimeOffset / DAY_DURATION_MINUTES) * 100}%`,
                  right: 0,
                  left: 1,
                  zIndex: 2,
                  borderTop: "1px dashed",
                  borderColor: "primary.main",
                  pointerEvents: "none",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -5,
                    left: -5,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: "calc(100% + 12px)",
                    width: 46,
                    color: "primary.main",
                    fontWeight: 700,
                    textAlign: "right",
                    transform: "translateY(-50%)",
                  }}
                >
                  {formatTime(currentTime.toISOString())}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const HomePage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [desktopDate, setDesktopDate] = useState(() => new Date());

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const now = new Date();

  const nextEvent = getNextEventOccurrence(events, now);

  const todayEvents = getEventsForDate(events, now);

  const nearestFreeWindow = getNearestFreeWindow(todayEvents, now);

  const desktopEvents = getEventsForDate(events, desktopDate);
  const desktopDateIsToday = isSameDay(desktopDate, now);

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
    <Stack spacing={0}>
      <Box
        sx={{
          display: {
            xs: "grid",
            md: "none",
          },
          width: "100%",
          minHeight: 634,
          height: "calc(100dvh - 160px)",
          maxHeight: 720,
          gridTemplateRows:
            "minmax(210px, 1.25fr) minmax(205px, 1.15fr) minmax(155px, 0.8fr)",
          gap: 2,
        }}
      >
        <NextEventCard event={nextEvent} onOpenDetails={setSelectedEvent} />

        <DaySummaryCard events={todayEvents} />

        <FreeWindowCard window={nearestFreeWindow} />
      </Box>

      <Box
        sx={{
          display: {
            xs: "none",
            md: "grid",
          },
          minHeight: 640,
          height: "calc(100dvh - 136px)",
          gridTemplateColumns: "minmax(0, 1.7fr) minmax(280px, 1fr)",
          gap: 2,
        }}
      >
        <DayTimeline
          events={desktopEvents}
          date={desktopDate}
          onOpenDetails={setSelectedEvent}
          onDateChange={setDesktopDate}
        />

        <Box
          sx={{
            display: "grid",
            minWidth: 0,
            gridTemplateRows:
              "minmax(210px, 1.25fr) minmax(205px, 1.15fr) minmax(155px, 0.8fr)",
            gap: 2,
          }}
        >
          <NextEventCard event={nextEvent} onOpenDetails={setSelectedEvent} />

          <DaySummaryCard events={desktopEvents} />

          <FreeWindowCard
            window={nearestFreeWindow}
            showDate={desktopDate > now && !desktopDateIsToday}
          />
        </Box>
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
