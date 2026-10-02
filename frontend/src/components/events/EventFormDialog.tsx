import { Close } from "@mui/icons-material";

import {
  Alert,
  AppBar,
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

import { useState } from "react";

import type {
  EventFormat,
  EventType,
  RepeatInterval,
} from "../../types/Event";
import { TimeInput } from "./TimeInput";

export interface EventFormValues {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  eventType: EventType;
  format: EventFormat;
  repeatInterval: RepeatInterval;
  room?: string;
  meetingUrl?: string;
}

interface EventFormDialogProps {
  open: boolean;
  heading: string;
  submitLabel: string;
  pendingLabel: string;
  errorMessage: string;
  initialValues: EventFormValues;
  isPending: boolean;
  isError: boolean;
  onSubmit: (values: EventFormValues) => void;
  onClose: () => void;
}

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTimePart = (value: number) => String(value).padStart(2, "0");

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

export const EventFormDialog = ({
  open,
  heading,
  submitLabel,
  pendingLabel,
  errorMessage,
  initialValues,
  isPending,
  isError,
  onSubmit,
  onClose,
}: EventFormDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const initialStart = new Date(initialValues.startsAt);
  const initialEnd = new Date(initialValues.endsAt);

  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [date, setDate] = useState(formatDateInput(initialStart));
  const [startHours, setStartHours] = useState(
    formatTimePart(initialStart.getHours()),
  );
  const [startMinutes, setStartMinutes] = useState(
    formatTimePart(initialStart.getMinutes()),
  );
  const [endHours, setEndHours] = useState(
    formatTimePart(initialEnd.getHours()),
  );
  const [endMinutes, setEndMinutes] = useState(
    formatTimePart(initialEnd.getMinutes()),
  );
  const [eventType, setEventType] = useState(initialValues.eventType);
  const [repeatInterval, setRepeatInterval] = useState(
    initialValues.repeatInterval,
  );
  const [format, setFormat] = useState(initialValues.format);
  const [room, setRoom] = useState(initialValues.room ?? "");
  const [meetingUrl, setMeetingUrl] = useState(
    initialValues.meetingUrl ?? "",
  );

  const isTitleValid = title.trim().length > 0;
  const isLocationValid =
    format === "OFFLINE"
      ? room.trim().length > 0
      : meetingUrl.trim().length > 0;
  const isStartTimeValid = isValidTimePart(startHours, startMinutes);
  const isEndTimeValid = isValidTimePart(endHours, endMinutes);
  const startDate = isStartTimeValid
    ? new Date(`${date}T${startHours}:${startMinutes}:00`)
    : null;
  const endDate = isEndTimeValid
    ? new Date(`${date}T${endHours}:${endMinutes}:00`)
    : null;
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

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      eventType,
      format,
      repeatInterval,
      room: format === "OFFLINE" ? room.trim() : undefined,
      meetingUrl: format === "ONLINE" ? meetingUrl.trim() : undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            maxWidth: {
              lg: 720,
            },
            maxHeight: {
              lg: "calc(100vh - 64px)",
            },
            borderRadius: {
              lg: 3,
            },
          },
        },
      }}
    >
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          flexShrink: 0,
          borderBottom: {
            lg: "1px solid",
          },
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={onClose}
            aria-label="Закрыть"
            disabled={isPending}
          >
            <Close />
          </IconButton>

          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            {heading}
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              gridTemplateAreas: {
                xs: `
                  "title"
                  "description"
                  "eventType"
                  "date"
                  "time"
                  "repeat"
                  "format"
                  "location"
                `,
                lg: `
                  "title title"
                  "description description"
                  "eventType repeat"
                  "date date"
                  "time time"
                  "format format"
                  "location location"
                `,
              },
              gap: 2.5,
            }}
          >
            <TextField
              label="Название"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например, встреча с научной группой"
              fullWidth
              sx={{ gridArea: "title" }}
            />

            <TextField
              label="Описание"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              multiline
              minRows={3}
              fullWidth
              sx={{ gridArea: "description" }}
            />

            <TextField
              select
              label="Тип события"
              value={eventType}
              onChange={(event) =>
                setEventType(event.target.value as EventType)
              }
              fullWidth
              sx={{ gridArea: "eventType" }}
            >
              <MenuItem value="LECTURE">Лекция</MenuItem>
              <MenuItem value="SEMINAR">Семинар</MenuItem>
              <MenuItem value="WORK_MEETING">Совещание</MenuItem>
              <MenuItem value="MEETING">Встреча</MenuItem>
            </TextField>

            <TextField
              label="Дата"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              sx={{ gridArea: "date" }}
            />

            <Box sx={{ gridArea: "time" }}>
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
                  sx={{ display: "block", mt: 0.5 }}
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
              sx={{ gridArea: "repeat" }}
            >
              <MenuItem value="WEEK">Раз в неделю</MenuItem>
              <MenuItem value="TWO_WEEKS">Раз в две недели</MenuItem>
              <MenuItem value="MONTH">Раз в месяц</MenuItem>
              <MenuItem value="NONE">Не повторять</MenuItem>
            </TextField>

            <Box sx={{ gridArea: "format" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Формат
              </Typography>

              <ToggleButtonGroup
                value={format}
                exclusive
                onChange={(_, value: EventFormat | null) => {
                  if (value) {
                    setFormat(value);
                  }
                }}
                fullWidth
              >
                <ToggleButton value="OFFLINE">Очно</ToggleButton>
                <ToggleButton value="ONLINE">Онлайн</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {format === "OFFLINE" ? (
              <TextField
                label="Аудитория"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="Например, П-8"
                fullWidth
                sx={{ gridArea: "location" }}
              />
            ) : (
              <TextField
                label="Ссылка на встречу"
                value={meetingUrl}
                onChange={(event) => setMeetingUrl(event.target.value)}
                placeholder="https://..."
                fullWidth
                sx={{ gridArea: "location" }}
              />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Stack
            spacing={1.5}
            sx={{
              alignItems: {
                xs: "stretch",
                lg: "flex-end",
              },
            }}
          >
            {isError && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {errorMessage}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth={isMobile}
              onClick={handleSubmit}
              disabled={!isFormValid || isPending}
            >
              {isPending ? pendingLabel : submitLabel}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
};
