import {
  Add,
  Close,
  KeyboardArrowDown,
  Search,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Drawer,
  Fab,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import { type Dispatch, type SetStateAction, useState } from "react";

import { getCurrentUser } from "../api/auth";
import { AUTH_QUERY_KEY } from "../api/authQuery";
import { getEvents } from "../api/events";
import { CreateEventDialog } from "../components/events/CreateEventDialog";
import { DesktopEventRow } from "../components/events/DesktopEventRow";
import { EventDetailsDialog } from "../components/events/EventDetailsDialog";
import { MobileEventCard } from "../components/events/MobileEventCard";
import { MobileEventFilterMenu } from "../components/events/MobileEventFilterMenu";
import { eventTypeLabels } from "../constants/events";
import { getNextEventOccurrenceForEvent } from "./schedule/scheduleUtils";
import type {
  Event,
  EventFormat,
  EventType,
  RepeatInterval,
} from "../types/Event";

type FormatFilter = EventFormat;
type RepeatFilter = "ALL" | RepeatInterval;
type TypeFilter = EventType;
type DateFilter = "UPCOMING" | "PAST";
type MobileFilterMenu = "FORMAT" | "TYPE" | "DATE";

const formatOptions: Array<{ value: FormatFilter; label: string }> = [
  { value: "OFFLINE", label: "Очно" },
  { value: "ONLINE", label: "Онлайн" },
];

const typeOptions: Array<{ value: TypeFilter; label: string }> = [
  { value: "LECTURE", label: "Лекция" },
  { value: "SEMINAR", label: "Семинар" },
  { value: "WORK_MEETING", label: "Совещание" },
  { value: "MEETING", label: "Встреча" },
];

const dateOptions: Array<{ value: DateFilter; label: string }> = [
  { value: "UPCOMING", label: "Предстоящие" },
  { value: "PAST", label: "Прошедшие" },
];

const mobileFilterButtonStyles = {
  minWidth: "max-content",
  minHeight: 36,
  px: 1.5,
  borderColor: "app.border.card",
  borderRadius: 10,
  color: "text.primary",
  fontSize: "0.75rem",
  fontWeight: 650,
  textTransform: "none",
  whiteSpace: "nowrap",
  "& .MuiButton-endIcon": { ml: 0.35 },
  "@media (max-width: 399.95px)": {
    px: 1.25,
    "& .MuiButton-endIcon": { display: "none" },
  },
};

export const EventsPage = () => {
  const [currentTime] = useState(() => Date.now());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventAction, setSelectedEventAction] = useState<
    "details" | "edit" | "delete"
  >("details");
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileFilterMenu, setMobileFilterMenu] =
    useState<MobileFilterMenu | null>(null);
  const [mobileFilterAnchor, setMobileFilterAnchor] =
    useState<HTMLElement | null>(null);
  const [formatFilters, setFormatFilters] = useState<FormatFilter[]>([]);
  const [typeFilters, setTypeFilters] = useState<TypeFilter[]>([]);
  const [dateFilters, setDateFilters] = useState<DateFilter[]>([]);
  const [repeatFilter, setRepeatFilter] = useState<RepeatFilter>("ALL");
  const [onlyMine, setOnlyMine] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
  });

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const eventsWithNearestOccurrences = events.map((event) => {
    if (event.repeatInterval === "NONE") {
      return event;
    }

    return (
      getNextEventOccurrenceForEvent(event, new Date(currentTime)) ?? event
    );
  });

  const sortedEvents = [...eventsWithNearestOccurrences].sort(
    (first, second) => {
      const firstStart = new Date(first.startsAt).getTime();
      const secondStart = new Date(second.startsAt).getTime();
      const firstIsCurrentOrUpcoming =
        new Date(first.endsAt).getTime() >= currentTime;
      const secondIsCurrentOrUpcoming =
        new Date(second.endsAt).getTime() >= currentTime;

      if (firstIsCurrentOrUpcoming !== secondIsCurrentOrUpcoming) {
        return firstIsCurrentOrUpcoming ? -1 : 1;
      }

      return firstIsCurrentOrUpcoming
        ? firstStart - secondStart
        : secondStart - firstStart;
    },
  );

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ru-RU");
  const activeFiltersCount =
    Number(formatFilters.length > 0) +
    Number(typeFilters.length > 0) +
    Number(dateFilters.length > 0) +
    Number(repeatFilter !== "ALL") +
    Number(onlyMine);
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
      formatFilters.length === 0 || formatFilters.includes(event.format);
    const matchesType =
      typeFilters.length === 0 || typeFilters.includes(event.eventType);
    const eventEndTime = new Date(event.endsAt).getTime();
    const matchesDate =
      dateFilters.length === 0 ||
      (dateFilters.includes("UPCOMING") && eventEndTime >= currentTime) ||
      (dateFilters.includes("PAST") && eventEndTime < currentTime);
    const matchesRepeat =
      repeatFilter === "ALL" || event.repeatInterval === repeatFilter;
    const matchesOwner = !onlyMine || event.creatorId === currentUser?.id;

    return (
      matchesSearch &&
      matchesFormat &&
      matchesType &&
      matchesDate &&
      matchesRepeat &&
      matchesOwner
    );
  });

  const resetFilters = () => {
    setFormatFilters([]);
    setTypeFilters([]);
    setDateFilters([]);
    setRepeatFilter("ALL");
    setOnlyMine(false);
  };

  const formatFilterLabel =
    formatFilters.length === 1
      ? formatOptions.find(({ value }) => value === formatFilters[0])?.label
      : formatFilters.length > 1
        ? `Формат (${formatFilters.length})`
        : "Формат";
  const typeFilterLabel =
    typeFilters.length === 1
      ? eventTypeLabels[typeFilters[0]]
      : typeFilters.length > 1
        ? `Тип (${typeFilters.length})`
        : "Тип";
  const dateFilterLabel =
    dateFilters.length === 1
      ? dateOptions.find(({ value }) => value === dateFilters[0])?.label
      : dateFilters.length > 1
        ? `Дата (${dateFilters.length})`
        : "Дата";

  const openMobileFilterMenu = (
    menu: MobileFilterMenu,
    anchor: HTMLElement,
  ) => {
    setMobileFilterMenu(menu);
    setMobileFilterAnchor(anchor);
  };

  const closeMobileFilterMenu = () => {
    setMobileFilterMenu(null);
    setMobileFilterAnchor(null);
  };

  const toggleFilterValue = <Value extends string>(
    value: Value,
    setValues: Dispatch<SetStateAction<Value[]>>,
  ) => {
    setValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const openEvent = (
    event: Event,
    action: "details" | "edit" | "delete" = "details",
  ) => {
    setSelectedEventAction(action);
    setSelectedEvent(event);
  };

  return (
    <Stack
      spacing={{ xs: 1.5, lg: 3 }}
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
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

          <Typography
            color="text.secondary"
            sx={{ display: { xs: "none", lg: "block" }, mt: 0.5 }}
          >
            Все события вашего расписания
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateEventOpen(true)}
          sx={{
            display: { xs: "none", lg: "inline-flex" },
            flexShrink: 0,
          }}
        >
          Создать событие
        </Button>
      </Stack>

      {!isLoading && !isError && sortedEvents.length > 0 && (
        <TextField
          type="text"
          placeholder="Поиск по названию, аудитории или описанию"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          autoComplete="off"
          fullWidth
          size="small"
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
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.paper",
            },
          }}
        />
      )}

      {!isLoading && !isError && sortedEvents.length > 0 && (
        <Box
          sx={{
            display: { xs: "block", lg: "none" },
            mx: -0.5,
            px: 0.5,
            pb: 0.25,
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: "max-content",
              minWidth: "100%",
              justifyContent: "space-between",
              gap: 0.75,
            }}
          >
            <Button
              variant={activeFiltersCount > 0 ? "contained" : "outlined"}
              endIcon={<KeyboardArrowDown />}
              onClick={() => {
                closeMobileFilterMenu();
                setFiltersOpen(true);
              }}
              sx={mobileFilterButtonStyles}
            >
              {activeFiltersCount > 0 ? `Все (${activeFiltersCount})` : "Все"}
            </Button>
            <Button
              variant={formatFilters.length === 0 ? "outlined" : "contained"}
              endIcon={<KeyboardArrowDown />}
              onClick={(event) =>
                openMobileFilterMenu("FORMAT", event.currentTarget)
              }
              sx={mobileFilterButtonStyles}
            >
              {formatFilterLabel}
            </Button>
            <Button
              variant={typeFilters.length === 0 ? "outlined" : "contained"}
              endIcon={<KeyboardArrowDown />}
              onClick={(event) =>
                openMobileFilterMenu("TYPE", event.currentTarget)
              }
              sx={mobileFilterButtonStyles}
            >
              {typeFilterLabel}
            </Button>
            <Button
              variant={dateFilters.length === 0 ? "outlined" : "contained"}
              endIcon={<KeyboardArrowDown />}
              onClick={(event) =>
                openMobileFilterMenu("DATE", event.currentTarget)
              }
              sx={mobileFilterButtonStyles}
            >
              {dateFilterLabel}
            </Button>

            {activeFiltersCount > 0 && (
              <IconButton
                aria-label="Сбросить все фильтры"
                onClick={() => {
                  closeMobileFilterMenu();
                  resetFilters();
                }}
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  border: "1px solid",
                  borderColor: "app.border.card",
                  bgcolor: "background.paper",
                  color: "text.secondary",
                }}
              >
                <Close sx={{ fontSize: 19 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      {!isLoading && !isError && sortedEvents.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            display: {
              xs: "none",
              lg: "flex",
            },
            alignItems: "center",
            gap: 1,
            p: 1.25,
            borderColor: "app.border.card",
            borderRadius: 3,
          }}
        >
          <Button
            variant={activeFiltersCount > 0 ? "contained" : "outlined"}
            endIcon={<KeyboardArrowDown />}
            onClick={() => {
              closeMobileFilterMenu();
              setFiltersOpen(true);
            }}
            sx={mobileFilterButtonStyles}
          >
            {activeFiltersCount > 0 ? `Все (${activeFiltersCount})` : "Все"}
          </Button>
          <Button
            variant={formatFilters.length === 0 ? "outlined" : "contained"}
            endIcon={<KeyboardArrowDown />}
            onClick={(event) =>
              openMobileFilterMenu("FORMAT", event.currentTarget)
            }
            sx={mobileFilterButtonStyles}
          >
            {formatFilterLabel}
          </Button>
          <Button
            variant={typeFilters.length === 0 ? "outlined" : "contained"}
            endIcon={<KeyboardArrowDown />}
            onClick={(event) =>
              openMobileFilterMenu("TYPE", event.currentTarget)
            }
            sx={mobileFilterButtonStyles}
          >
            {typeFilterLabel}
          </Button>
          <Button
            variant={dateFilters.length === 0 ? "outlined" : "contained"}
            endIcon={<KeyboardArrowDown />}
            onClick={(event) =>
              openMobileFilterMenu("DATE", event.currentTarget)
            }
            sx={mobileFilterButtonStyles}
          >
            {dateFilterLabel}
          </Button>

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={onlyMine}
                onChange={(event) => setOnlyMine(event.target.checked)}
              />
            }
            label="Только мои"
            sx={{
              ml: 0.5,
              mr: 0,
              "& .MuiFormControlLabel-label": {
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
              },
            }}
          />

          {activeFiltersCount > 0 && (
            <IconButton
              aria-label="Сбросить все фильтры"
              onClick={resetFilters}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}

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
            display: { xs: "grid", lg: "none" },
            gap: 1,
            p: 0,
            m: 0,
            listStyle: "none",
          }}
        >
          {filteredEvents.map((event) => (
            <MobileEventCard
              key={event.id}
              event={event}
              onOpen={() => openEvent(event)}
            />
          ))}
        </Box>
      )}

      {!isLoading && !isError && filteredEvents.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            display: { xs: "none", lg: "block" },
            p: 1.5,
            m: 0,
            borderColor: "app.border.card",
            borderRadius: 3,
          }}
        >
          <Box
            component="ul"
            sx={{ display: "grid", gap: 1, p: 0, m: 0, listStyle: "none" }}
          >
            {filteredEvents.map((event) => (
              <DesktopEventRow
                key={event.id}
                event={event}
                onOpen={() => openEvent(event)}
                onEdit={() => openEvent(event, "edit")}
                onDelete={() => openEvent(event, "delete")}
              />
            ))}
          </Box>
        </Paper>
      )}

      {selectedEvent && (
        <EventDetailsDialog
          key={`${selectedEvent.id}-${selectedEventAction}`}
          event={selectedEvent}
          initialAction={selectedEventAction}
          onClose={() => {
            setSelectedEvent(null);
            setSelectedEventAction("details");
          }}
          onEventUpdated={setSelectedEvent}
        />
      )}

      <Fab
        color="primary"
        aria-label="Создать событие"
        onClick={() => setCreateEventOpen(true)}
        sx={{
          display: { xs: "flex", lg: "none" },
          position: "fixed",
          right: 16,
          bottom: { xs: 80, md: 24 },
          zIndex: 900,
        }}
      >
        <Add />
      </Fab>

      {createEventOpen && (
        <CreateEventDialog
          open
          initialDate={new Date()}
          onClose={() => setCreateEventOpen(false)}
        />
      )}

      <MobileEventFilterMenu
        anchor={mobileFilterMenu === "FORMAT" ? mobileFilterAnchor : null}
        options={formatOptions}
        selectedValues={formatFilters}
        onToggle={(value) =>
          toggleFilterValue(value as FormatFilter, setFormatFilters)
        }
        onClose={closeMobileFilterMenu}
      />

      <MobileEventFilterMenu
        anchor={mobileFilterMenu === "TYPE" ? mobileFilterAnchor : null}
        options={typeOptions}
        selectedValues={typeFilters}
        onToggle={(value) =>
          toggleFilterValue(value as TypeFilter, setTypeFilters)
        }
        onClose={closeMobileFilterMenu}
      />

      <MobileEventFilterMenu
        anchor={mobileFilterMenu === "DATE" ? mobileFilterAnchor : null}
        options={dateOptions}
        selectedValues={dateFilters}
        onToggle={(value) =>
          toggleFilterValue(value as DateFilter, setDateFilters)
        }
        onClose={closeMobileFilterMenu}
      />

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

              <FormGroup row>
                {formatOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    label={option.label}
                    control={
                      <Checkbox
                        checked={formatFilters.includes(option.value)}
                        onChange={() =>
                          toggleFilterValue(option.value, setFormatFilters)
                        }
                      />
                    }
                  />
                ))}
              </FormGroup>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Тип события
              </Typography>
              <FormGroup row>
                {typeOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    label={option.label}
                    control={
                      <Checkbox
                        checked={typeFilters.includes(option.value)}
                        onChange={() =>
                          toggleFilterValue(option.value, setTypeFilters)
                        }
                      />
                    }
                  />
                ))}
              </FormGroup>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Дата
              </Typography>
              <FormGroup row>
                {dateOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    label={option.label}
                    control={
                      <Checkbox
                        checked={dateFilters.includes(option.value)}
                        onChange={() =>
                          toggleFilterValue(option.value, setDateFilters)
                        }
                      />
                    }
                  />
                ))}
              </FormGroup>
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
