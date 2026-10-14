import {
  AccessTimeOutlined,
  CalendarMonthOutlined,
  DeleteOutlined,
  EditNoteOutlined,
  EditOutlined,
  ForumOutlined,
  GroupsOutlined,
  LocationOnOutlined,
  MenuBookOutlined,
  VideocamOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

import {
  eventTypeLabels,
  eventTypeStyles,
} from "../../constants/events";
import type { Event, EventType } from "../../types/Event";

interface DesktopEventRowProps {
  event: Event;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const eventTypeIcons: Record<EventType, ReactNode> = {
  LECTURE: <MenuBookOutlined />,
  SEMINAR: <EditNoteOutlined />,
  WORK_MEETING: <GroupsOutlined />,
  MEETING: <ForumOutlined />,
};

const formatDate = (value: string) => {
  const formatted = new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const DesktopEventRow = ({
  event,
  onOpen,
  onEdit,
  onDelete,
}: DesktopEventRowProps) => {
  const isOnline = event.format === "ONLINE";
  const typeStyle = eventTypeStyles[event.eventType];

  return (
    <Card
      component="li"
      variant="outlined"
      sx={{
        display: "grid",
        gridTemplateColumns:
          "64px minmax(0, 1.2fr) minmax(0, 0.8fr) 212px",
        gap: 2,
        alignItems: "center",
        minHeight: 104,
        p: 1.5,
        borderColor: "app.border.card",
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: (theme) => theme.appShadows.button,
      }}
    >
      <Box
        sx={{
          display: "grid",
          width: 64,
          height: 64,
          placeItems: "center",
          borderRadius: 2.5,
          bgcolor: typeStyle.surface,
          color: typeStyle.main,
          "& svg": { fontSize: 34 },
        }}
      >
        {eventTypeIcons[event.eventType]}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 750,
            lineHeight: 1.25,
            overflowWrap: "normal",
            wordBreak: "normal",
          }}
        >
          {event.title}
        </Typography>

        <Stack
          direction="row"
          sx={{ mt: 0.65, alignItems: "center", gap: 1.25, minWidth: 0 }}
        >
          <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
            <CalendarMonthOutlined sx={{ color: "text.secondary", fontSize: 17 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {formatDate(event.startsAt)}
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
            <AccessTimeOutlined sx={{ color: "text.secondary", fontSize: 17 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {formatTime(event.startsAt)}–{formatTime(event.endsAt)}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          sx={{ mt: 0.45, alignItems: "center", gap: 0.5, minWidth: 0 }}
        >
          {isOnline ? (
            <VideocamOutlined sx={{ color: "text.secondary", fontSize: 17 }} />
          ) : (
            <LocationOnOutlined sx={{ color: "text.secondary", fontSize: 17 }} />
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: "nowrap" }}
          >
            {isOnline ? "Онлайн" : `Аудитория ${event.room}`}
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75 }}>
          <Chip
            label={eventTypeLabels[event.eventType]}
            size="small"
            sx={{
              height: 24,
              bgcolor: typeStyle.surface,
              color: typeStyle.main,
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          />
          {isOnline && (
            <Chip
              label="Онлайн"
              size="small"
              sx={{
                height: 24,
                bgcolor: "app.status.success.surface",
                color: "app.status.success.text",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            />
          )}
          {event.repeatInterval !== "NONE" && (
            <Chip
              label="Повторяется"
              size="small"
              sx={{
                height: 24,
                bgcolor: "app.background.field",
                color: "text.secondary",
                fontSize: "0.7rem",
                fontWeight: 650,
              }}
            />
          )}
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            mt: 0.75,
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
        >
          {event.description || "Описание не добавлено"}
        </Typography>
      </Box>

      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "flex-end", gap: 0.75 }}
      >
        <Button
          variant="outlined"
          onClick={onOpen}
          sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
        >
          Подробнее
        </Button>
        <IconButton
          aria-label={`Редактировать событие «${event.title}»`}
          onClick={onEdit}
          sx={{ border: "1px solid", borderColor: "app.border.field" }}
        >
          <EditOutlined fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          aria-label={`Удалить событие «${event.title}»`}
          onClick={onDelete}
          sx={{ border: "1px solid", borderColor: "app.status.error.border" }}
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </Stack>
    </Card>
  );
};
