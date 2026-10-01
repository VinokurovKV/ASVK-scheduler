import {
  AccessTime,
  CalendarMonth,
  Close,
  LocationOn,
  Repeat,
  Videocam,
} from "@mui/icons-material";

import {
  AppBar,
  Box,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import type { Event, RepeatInterval } from "../../types/Event";

interface EventDetailsDialogProps {
  event: Event;
  onClose: () => void;
}

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
    year: "numeric",
  }).format(new Date(date));

const formatTime = (date: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailRow = ({ icon, label, value }: DetailRowProps) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
    <Box
      sx={{
        display: "flex",
        pt: 0.25,
        color: "action.active",
      }}
    >
      {icon}
    </Box>

    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography sx={{ overflowWrap: "anywhere" }}>{value}</Typography>
    </Box>
  </Stack>
);

export const EventDetailsDialog = ({
  event,
  onClose,
}: EventDetailsDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const online = event.format === "ONLINE";

  return (
    <Dialog
      open
      onClose={onClose}
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
          <IconButton edge="start" onClick={onClose} aria-label="Закрыть">
            <Close />
          </IconButton>

          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            Событие
          </Typography>
        </Toolbar>
      </AppBar>

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
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: {
                  xs: "1.75rem",
                  lg: "2rem",
                },
                fontWeight: 700,
                overflowWrap: "anywhere",
              }}
            >
              {event.title}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Chip label={online ? "Онлайн" : "Очно"} size="small" />
              <Chip
                label={repeatLabels[event.repeatInterval]}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Box>

          {event.description && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 0.75 }}
              >
                Описание
              </Typography>

              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {event.description}
              </Typography>
            </Box>
          )}

          <Divider />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            <DetailRow
              icon={<CalendarMonth fontSize="small" />}
              label="Дата"
              value={formatDate(event.startsAt)}
            />

            <DetailRow
              icon={<AccessTime fontSize="small" />}
              label="Время"
              value={`${formatTime(event.startsAt)}–${formatTime(event.endsAt)}`}
            />

            <DetailRow
              icon={<Repeat fontSize="small" />}
              label="Повторение"
              value={repeatLabels[event.repeatInterval]}
            />

            <DetailRow
              icon={
                online ? (
                  <Videocam fontSize="small" />
                ) : (
                  <LocationOn fontSize="small" />
                )
              }
              label={online ? "Формат" : "Место"}
              value={online ? "Онлайн" : `Аудитория ${event.room}`}
            />
          </Box>
        </Stack>
      </Box>
    </Dialog>
  );
};
