import {
  AccessTime,
  Close,
  LocationOn,
  Repeat,
  Search,
  Tune,
  Videocam,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getEvents } from "../api/events";
import { EventDetailsDialog } from "../components/events/EventDetailsDialog";
import type { Event, EventFormat, RepeatInterval } from "../types/Event";

type FormatFilter = "ALL" | EventFormat;
type RepeatFilter = "ALL" | RepeatInterval;

const repeatLabels: Record<RepeatInterval, string> = {
  NONE: "Не повторяется",
  WEEK: "Каждую неделю",
  TWO_WEEKS: "Каждые 2 недели",
  MONTH: "Каждый месяц",
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(date));

const formatTime = (date: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

const EventPlace = ({ event }: { event: Event }) => {
  const online = event.format === "ONLINE";

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        alignItems: "center",
        minWidth: 0,
      }}
    >
      {online ? (
        <Videocam fontSize="small" color="action" />
      ) : (
        <LocationOn fontSize="small" color="action" />
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {online ? "Онлайн" : `Аудитория ${event.room}`}
      </Typography>
    </Stack>
  );
};

export const EventsPage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("ALL");
  const [repeatFilter, setRepeatFilter] = useState<RepeatFilter>("ALL");

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const sortedEvents = [...events].sort(
    (first, second) =>
      new Date(first.startsAt).getTime() -
      new Date(second.startsAt).getTime(),
  );

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ru-RU");
  const activeFiltersCount =
    Number(formatFilter !== "ALL") + Number(repeatFilter !== "ALL");

  const filteredEvents = sortedEvents.filter((event) => {
    const searchableText = [
      event.title,
      event.description,
      event.room,
      event.meetingUrl,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("ru-RU");

    const matchesSearch =
      !normalizedQuery || searchableText.includes(normalizedQuery);
    const matchesFormat =
      formatFilter === "ALL" || event.format === formatFilter;
    const matchesRepeat =
      repeatFilter === "ALL" || event.repeatInterval === repeatFilter;

    return matchesSearch && matchesFormat && matchesRepeat;
  });

  const resetFilters = () => {
    setFormatFilter("ALL");
    setRepeatFilter("ALL");
  };

  return (
    <Stack
      spacing={3}
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Stack
        spacing={2}
        sx={{
          flexDirection: {
            xs: "column",
            md: "row",
          },
          alignItems: {
            xs: "stretch",
            md: "flex-end",
          },
          justifyContent: "space-between",
        }}
      >
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
            События
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Все события вашего расписания
          </Typography>
        </Box>

        {!isLoading && !isError && sortedEvents.length > 0 && (
          <Stack
            spacing={1}
            sx={{
              width: {
                xs: "100%",
                md: 420,
              },
              flexShrink: 0,
            }}
          >
            <TextField
              type="text"
              label="Поиск событий"
              placeholder="Название, описание или место"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoComplete="off"
              fullWidth
              slotProps={{
                htmlInput: {
                  inputMode: "search",
                  enterKeyHint: "search",
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label="Очистить поиск"
                        onClick={() => setSearchQuery("")}
                      >
                        <Close />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />

            <Button
              variant={activeFiltersCount > 0 ? "contained" : "outlined"}
              startIcon={<Tune />}
              onClick={() => setFiltersOpen(true)}
              sx={{
                display: {
                  xs: "inline-flex",
                  lg: "none",
                },
              }}
            >
              {activeFiltersCount > 0
                ? `Фильтры (${activeFiltersCount})`
                : "Фильтры"}
            </Button>
          </Stack>
        )}
      </Stack>

      {!isLoading && !isError && sortedEvents.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            display: {
              xs: "none",
              lg: "flex",
            },
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 3,
          }}
        >
          <Tune color="action" />

          <TextField
            select
            label="Формат"
            value={formatFilter}
            onChange={(event) =>
              setFormatFilter(event.target.value as FormatFilter)
            }
            size="small"
            sx={{ width: 180 }}
          >
            <MenuItem value="ALL">Все форматы</MenuItem>
            <MenuItem value="OFFLINE">Очно</MenuItem>
            <MenuItem value="ONLINE">Онлайн</MenuItem>
          </TextField>

          <TextField
            select
            label="Повторение"
            value={repeatFilter}
            onChange={(event) =>
              setRepeatFilter(event.target.value as RepeatFilter)
            }
            size="small"
            sx={{ width: 220 }}
          >
            <MenuItem value="ALL">Любое повторение</MenuItem>
            <MenuItem value="NONE">Не повторяется</MenuItem>
            <MenuItem value="WEEK">Раз в неделю</MenuItem>
            <MenuItem value="TWO_WEEKS">Раз в две недели</MenuItem>
            <MenuItem value="MONTH">Раз в месяц</MenuItem>
          </TextField>

          <Button
            onClick={resetFilters}
            disabled={activeFiltersCount === 0}
          >
            Сбросить
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: "auto" }}
          >
            Найдено: {filteredEvents.length}
          </Typography>
        </Paper>
      )}

      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 6,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">Не удалось загрузить события</Alert>
      )}

      {!isLoading && !isError && sortedEvents.length === 0 && (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography
              color="text.secondary"
              sx={{
                py: 4,
                textAlign: "center",
              }}
            >
              Событий пока нет
            </Typography>
          </CardContent>
        </Card>
      )}

      {!isLoading &&
        !isError &&
        sortedEvents.length > 0 &&
        filteredEvents.length === 0 && (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography
                color="text.secondary"
                role="status"
                sx={{
                  py: 4,
                  textAlign: "center",
                }}
              >
                По заданным параметрам ничего не найдено
              </Typography>
            </CardContent>
          </Card>
        )}

      {!isLoading && !isError && filteredEvents.length > 0 && (
        <Box
          component="ul"
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
            p: 0,
            m: 0,
            listStyle: "none",
          }}
        >
          {filteredEvents.map((event) => (
            <Card
              component="li"
              key={event.id}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              <CardActionArea
                onClick={() => setSelectedEvent(event)}
                aria-label={`Открыть событие «${event.title}»`}
                sx={{ height: "100%" }}
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
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 600,
                          }}
                        >
                          {event.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.25,
                            textTransform: "capitalize",
                          }}
                        >
                          {formatDate(event.startsAt)}
                        </Typography>
                      </Box>

                      <Chip
                        label={event.format === "ONLINE" ? "Онлайн" : "Очно"}
                        size="small"
                      />
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: "center" }}
                    >
                      <AccessTime fontSize="small" color="action" />

                      <Typography variant="body2" color="text.secondary">
                        {formatTime(event.startsAt)}
                        {"–"}
                        {formatTime(event.endsAt)}
                      </Typography>
                    </Stack>

                    <EventPlace event={event} />

                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: "center" }}
                    >
                      <Repeat fontSize="small" color="action" />

                      <Typography variant="body2" color="text.secondary">
                        {repeatLabels[event.repeatInterval]}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEventUpdated={setSelectedEvent}
        />
      )}

      <Drawer
        anchor="bottom"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: "100%",
              maxWidth: 600,
              mx: "auto",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            pb: "max(16px, env(safe-area-inset-bottom))",
          }}
        >
          <Stack spacing={2.5}>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Фильтры
              </Typography>

              <IconButton
                onClick={() => setFiltersOpen(false)}
                aria-label="Закрыть фильтры"
              >
                <Close />
              </IconButton>
            </Stack>

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Формат
              </Typography>

              <ToggleButtonGroup
                value={formatFilter}
                exclusive
                onChange={(_, value: FormatFilter | null) => {
                  if (value) {
                    setFormatFilter(value);
                  }
                }}
                fullWidth
              >
                <ToggleButton value="ALL">Все</ToggleButton>
                <ToggleButton value="OFFLINE">Очно</ToggleButton>
                <ToggleButton value="ONLINE">Онлайн</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField
              select
              label="Повторение"
              value={repeatFilter}
              onChange={(event) =>
                setRepeatFilter(event.target.value as RepeatFilter)
              }
              fullWidth
            >
              <MenuItem value="ALL">Любое</MenuItem>
              <MenuItem value="NONE">Не повторяется</MenuItem>
              <MenuItem value="WEEK">Раз в неделю</MenuItem>
              <MenuItem value="TWO_WEEKS">Раз в две недели</MenuItem>
              <MenuItem value="MONTH">Раз в месяц</MenuItem>
            </TextField>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                fullWidth
                onClick={resetFilters}
                disabled={activeFiltersCount === 0}
              >
                Сбросить
              </Button>

              <Button
                variant="contained"
                fullWidth
                onClick={() => setFiltersOpen(false)}
              >
                Готово
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
};
