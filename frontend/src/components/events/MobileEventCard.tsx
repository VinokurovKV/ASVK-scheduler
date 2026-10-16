import {
  CalendarMonthOutlined,
  ChevronRightRounded,
  EditNoteOutlined,
  ForumOutlined,
  GroupsOutlined,
  LocationOnOutlined,
  MenuBookOutlined,
  VideocamOutlined,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

import {
  eventTypeLabels,
  eventTypeStyles,
} from "../../constants/events";
import { getCalendarLabel } from "../../constants/calendars";
import { formatTeacherShortName } from "../../constants/teachers";
import type { Event, EventType } from "../../types/Event";

interface MobileEventCardProps {
  event: Event;
  onOpen: () => void;
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
  }).format(new Date(value));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const MobileEventCard = ({ event, onOpen }: MobileEventCardProps) => {
  const isOnline = event.format === "ONLINE";
  const typeStyle = eventTypeStyles[event.eventType];

  return (
    <Card
      component="li"
      variant="outlined"
      sx={{
        borderColor: "app.border.card",
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: (theme) => theme.appShadows.button,
        overflow: "hidden",
      }}
    >
      <CardActionArea
        onClick={onOpen}
        aria-label={`Открыть событие «${event.title}»`}
        sx={{
          display: "grid",
          gridTemplateColumns: "52px minmax(0, 1fr) 24px",
          alignItems: "center",
          gap: 1.25,
          p: 1.25,
        }}
      >
        <Box
          sx={{
            display: "grid",
            width: 52,
            height: 52,
            alignSelf: "start",
            placeItems: "center",
            borderRadius: 2.5,
            bgcolor: typeStyle.surface,
            color: typeStyle.main,
            "& svg": { fontSize: 29 },
          }}
        >
          {eventTypeIcons[event.eventType]}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.9rem",
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
            spacing={0.55}
            sx={{ mt: 0.55, minWidth: 0, alignItems: "center" }}
          >
            <CalendarMonthOutlined
              sx={{ flexShrink: 0, color: "text.secondary", fontSize: 16 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                minWidth: 0,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {formatDate(event.startsAt)} · {formatTime(event.startsAt)}–
              {formatTime(event.endsAt)}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.55}
            sx={{ mt: 0.4, minWidth: 0, alignItems: "center" }}
          >
            {isOnline ? (
              <VideocamOutlined
                sx={{ flexShrink: 0, color: "text.secondary", fontSize: 16 }}
              />
            ) : (
              <LocationOnOutlined
                sx={{ flexShrink: 0, color: "text.secondary", fontSize: 16 }}
              />
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              {isOnline ? "Онлайн" : `Аудитория ${event.room}`}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            sx={{ mt: 0.75, flexWrap: "wrap", gap: 0.5 }}
          >
            <Chip
              label={getCalendarLabel(event.calendar)}
              size="small"
              variant="outlined"
              sx={{
                height: 22,
                borderColor: "app.border.field",
                color: "text.secondary",
                fontSize: "0.66rem",
                fontWeight: 650,
              }}
            />

            <Chip
              label={eventTypeLabels[event.eventType]}
              size="small"
              sx={{
                height: 22,
                bgcolor: typeStyle.surface,
                color: typeStyle.main,
                fontSize: "0.66rem",
                fontWeight: 700,
              }}
            />

            {event.teacherName && (
              <Chip
                label={formatTeacherShortName(event.teacherName)}
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  borderColor: "app.border.field",
                  color: "text.secondary",
                  fontSize: "0.66rem",
                  fontWeight: 650,
                }}
              />
            )}

            {isOnline && (
              <Chip
                label="Онлайн"
                size="small"
                sx={{
                  height: 22,
                  bgcolor: "app.status.success.surface",
                  color: "app.status.success.text",
                  fontSize: "0.66rem",
                  fontWeight: 700,
                }}
              />
            )}

            {event.repeatInterval !== "NONE" && (
              <Chip
                label="Повторяется"
                size="small"
                sx={{
                  height: 22,
                  bgcolor: "app.background.field",
                  color: "text.secondary",
                  fontSize: "0.66rem",
                  fontWeight: 650,
                }}
              />
            )}
          </Stack>
        </Box>

        <ChevronRightRounded sx={{ color: "app.brand.accent" }} />
      </CardActionArea>
    </Card>
  );
};
