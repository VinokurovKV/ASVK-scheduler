import { Close } from "@mui/icons-material";

import {
  AppBar,
  Alert,
  Box,
  Button,
  Dialog,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createEvent } from "../../api/events";

import { useState } from "react";

import type { EventFormat, RepeatInterval } from "../../types/Event";

import { TimeInput } from "./TimeInput";

interface CreateEventDialogProps {
  open: boolean;
  initialDate: Date;
  onClose: () => void;
}

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isValidTimePart = (hours: string, minutes: string) => {
  if (hours.length !== 2 || minutes.length !== 2) {
    return false;
  }

  const hoursNumber = Number(hours);
  const minutesNumber = Number(minutes);

  return (
    hoursNumber >= 0 &&
    hoursNumber <= 23 &&
    minutesNumber >= 0 &&
    minutesNumber <= 59
  );
};

export const CreateEventDialog = ({
  open,
  initialDate,
  onClose,
}: CreateEventDialogProps) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState(formatDateInput(initialDate));

  const [startHours, setStartHours] = useState("10");
  const [startMinutes, setStartMinutes] = useState("00");

  const [endHours, setEndHours] = useState("11");
  const [endMinutes, setEndMinutes] = useState("00");

  const [repeatInterval, setRepeatInterval] = useState<RepeatInterval>("WEEK");

  const [format, setFormat] = useState<EventFormat>("OFFLINE");

  const [room, setRoom] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");

  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: createEvent,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["events"],
      });

      onClose();
    },
  });

  const handleFormatChange = (
    _: React.MouseEvent<HTMLElement>,
    value: EventFormat | null,
  ) => {
    if (value) {
      setFormat(value);
    }
  };

  const isTitleValid = title.trim().length > 0;

  const isLocationValid =
    format === "OFFLINE"
      ? room.trim().length > 0
      : meetingUrl.trim().length > 0;

  const isStartTimeValid = isValidTimePart(startHours, startMinutes);

  const isEndTimeValid = isValidTimePart(endHours, endMinutes);

  const startsAt = `${startHours}:${startMinutes}`;

  const endsAt = `${endHours}:${endMinutes}`;

  const startDate = isStartTimeValid
    ? new Date(`${date}T${startsAt}:00`)
    : null;

  const endDate = isEndTimeValid ? new Date(`${date}T${endsAt}:00`) : null;

  const isTimeOrderValid =
    startDate !== null &&
    endDate !== null &&
    endDate.getTime() > startDate.getTime();

  const isTimeOrderError =
    isStartTimeValid && isEndTimeValid && !isTimeOrderValid;

  const isFormValid =
    isTitleValid &&
    isLocationValid &&
    isStartTimeValid &&
    isEndTimeValid &&
    isTimeOrderValid;

  const handleSubmit = () => {
    if (!isFormValid || !startDate || !endDate) {
      return;
    }

    createEventMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,

      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),

      format,
      repeatInterval,

      room: format === "OFFLINE" ? room.trim() : undefined,

      meetingUrl: format === "ONLINE" ? meetingUrl.trim() : undefined,

      calendarId: 1,
      creatorId: 1,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton edge="start" onClick={onClose} aria-label="Закрыть">
            <Close />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              ml: 1,
              fontWeight: 600,
            }}
          >
            Новое событие
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Скроллируемая часть формы */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",

            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Stack spacing={2.5}>
            <TextField
              label="Название"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например, встреча с научной группой"
              fullWidth
            />

            <TextField
              label="Описание"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              multiline
              minRows={3}
              fullWidth
            />

            <TextField
              label="Дата"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              fullWidth
            />

            {/* Блок времени */}
            <Box>
              <Stack direction="row" spacing={2}>
                <TimeInput
                  label="Начало"
                  hours={startHours}
                  minutes={startMinutes}
                  onHoursChange={setStartHours}
                  onMinutesChange={setStartMinutes}
                  error={!isStartTimeValid}
                  helperText={!isStartTimeValid ? "Неверное время" : undefined}
                />

                <TimeInput
                  label="Окончание"
                  hours={endHours}
                  minutes={endMinutes}
                  onHoursChange={setEndHours}
                  onMinutesChange={setEndMinutes}
                  error={!isEndTimeValid || isTimeOrderError}
                  helperText={!isEndTimeValid ? "Неверное время" : undefined}
                />
              </Stack>

              {isTimeOrderError && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    display: "block",
                    mt: 0.5,
                  }}
                >
                  Окончание раньше начала
                </Typography>
              )}
            </Box>

            <TextField
              select
              label="Повторять"
              value={repeatInterval}
              onChange={(event) =>
                setRepeatInterval(event.target.value as RepeatInterval)
              }
              fullWidth
            >
              <MenuItem value="WEEK">Раз в неделю</MenuItem>
              <MenuItem value="TWO_WEEKS">Раз в две недели</MenuItem>
              <MenuItem value="MONTH">Раз в месяц</MenuItem>
              <MenuItem value="NONE">Не повторять</MenuItem>
            </TextField>

            {/* Формат */}
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1,
                }}
              >
                Формат
              </Typography>

              <ToggleButtonGroup
                value={format}
                exclusive
                onChange={handleFormatChange}
                fullWidth
              >
                <ToggleButton value="OFFLINE">Очно</ToggleButton>

                <ToggleButton value="ONLINE">Онлайн</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Место / ссылка */}
            {format === "OFFLINE" ? (
              <TextField
                label="Аудитория"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="Например, П-8"
                fullWidth
              />
            ) : (
              <TextField
                label="Ссылка на встречу"
                value={meetingUrl}
                onChange={(event) => setMeetingUrl(event.target.value)}
                placeholder="https://..."
                fullWidth
              />
            )}
          </Stack>
        </Box>

        {/* Нижняя закреплённая часть */}
        <Box
          sx={{
            flexShrink: 0,
            p: 2,

            borderTop: "1px solid",
            borderColor: "divider",

            backgroundColor: "background.paper",
          }}
        >
          {createEventMutation.isError && (
            <Alert
              severity="error"
              sx={{
                mb: 1.5,
              }}
            >
              Не удалось создать событие
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={!isFormValid || createEventMutation.isPending}
          >
            {createEventMutation.isPending ? "Создание..." : "Создать событие"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
