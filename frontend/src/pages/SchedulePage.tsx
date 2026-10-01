import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fab,
  Stack,
  Typography,
} from "@mui/material";

import { Add } from "@mui/icons-material";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { CreateEventDialog } from "../components/events/CreateEventDialog";

import { getEvents } from "../api/events";

import { DesktopSchedule } from "./schedule/DesktopSchedule";
import { MobileSchedule } from "./schedule/MobileSchedule";

import {
  addDays,
  getEventsForWeek,
  isSameDay,
  startOfWeek,
} from "./schedule/scheduleUtils";

export const SchedulePage = () => {
  const today = new Date();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));

  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  });

  const [createEventOpen, setCreateEventOpen] = useState(false);

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const changeWeek = (direction: number) => {
    const currentWeekDays = Array.from({ length: 7 }, (_, index) =>
      addDays(weekStart, index),
    );

    const selectedDayIndex = currentWeekDays.findIndex((date) =>
      isSameDay(date, selectedDate),
    );

    const newWeekStart = addDays(weekStart, direction * 7);

    setWeekStart(newWeekStart);

    setSelectedDate(
      addDays(newWeekStart, selectedDayIndex >= 0 ? selectedDayIndex : 0),
    );
  };

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
    return <Alert severity="error">Не удалось загрузить расписание</Alert>;
  }

  const weekEvents = getEventsForWeek(events, weekStart);

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
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
          Расписание
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateEventOpen(true)}
          sx={{
            display: {
              xs: "none",
              lg: "inline-flex",
            },
          }}
        >
          Создать событие
        </Button>
      </Stack>

      {/* Mobile + tablet */}
      <Box
        sx={{
          display: {
            xs: "block",
            lg: "none",
          },
        }}
      >
        <MobileSchedule
          events={weekEvents}
          weekStart={weekStart}
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          onWeekChange={changeWeek}
        />
      </Box>

      {/* Desktop */}
      <Box
        sx={{
          display: {
            xs: "none",
            lg: "block",
          },
        }}
      >
        <DesktopSchedule
          events={weekEvents}
          weekStart={weekStart}
          onWeekChange={changeWeek}
        />
      </Box>

      <Fab
        color="primary"
        aria-label="Создать событие"
        onClick={() => setCreateEventOpen(true)}
        sx={{
          display: {
            xs: "flex",
            lg: "none",
          },

          position: "fixed",

          right: 16,

          bottom: {
            xs: 80,
            md: 24,
          },

          zIndex: 900,
        }}
      >
        <Add />
      </Fab>

      {createEventOpen && (
        <CreateEventDialog
          open
          initialDate={selectedDate}
          onClose={() => setCreateEventOpen(false)}
        />
      )}
    </Stack>
  );
};
