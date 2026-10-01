import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getEvents } from "../api/events";

import { DesktopSchedule } from "./schedule/DesktopSchedule";
import { MobileSchedule } from "./schedule/MobileSchedule";

import { addDays, isSameDay, startOfWeek } from "./schedule/scheduleUtils";

export const SchedulePage = () => {
  const today = new Date();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));

  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  });

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

  return (
    <Stack spacing={3}>
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
          events={events}
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
          events={events}
          weekStart={weekStart}
          onWeekChange={changeWeek}
        />
      </Box>
    </Stack>
  );
};
