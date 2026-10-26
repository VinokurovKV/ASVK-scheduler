import {
  CalendarMonthOutlined,
  ChevronRightRounded,
  ForumOutlined,
  GroupsOutlined,
  LocationOnOutlined,
  VideocamOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import type { Meeting, MeetingParticipant } from "../../api/meetings";
import { getAvatarColorSx } from "../../constants/avatarColors";
import { eventTypeStyles } from "../../constants/events";

interface MobileMeetingCardProps {
  meeting: Meeting;
  onOpen: () => void;
}

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

const getOrganizerRoleLabel = (meeting: Meeting) => {
  if (meeting.creator.role === "STUDENT") {
    return meeting.creator.groupNumber
      ? `Студент · Группа ${meeting.creator.groupNumber}`
      : "Студент";
  }

  if (meeting.creator.role === "POSTGRADUATE") {
    return "Аспирант";
  }

  if (meeting.creator.role === "EMPLOYEE") {
    return "Сотрудник";
  }

  return "Пользователь";
};

const getParticipantInitials = (
  participant: Pick<
    MeetingParticipant,
    "name" | "firstName" | "lastName"
  >,
) => {
  const firstInitial = participant.firstName?.charAt(0);
  const lastInitial = participant.lastName?.charAt(0);

  if (firstInitial || lastInitial) {
    return `${firstInitial ?? ""}${lastInitial ?? ""}`.toUpperCase();
  }

  return participant.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

export const MobileMeetingCard = ({
  meeting,
  onOpen,
}: MobileMeetingCardProps) => {
  const online = meeting.format === "ONLINE";
  const typeStyle = eventTypeStyles[meeting.eventType];
  const cardParticipants = [
    {
      id: meeting.creator.id,
      name: meeting.creator.name,
      firstName: null,
      lastName: null,
      avatarColor: meeting.creator.avatarColor,
    },
    ...meeting.participants.filter(
      (participant) => participant.id !== meeting.creator.id,
    ),
  ];
  const visibleParticipants = cardParticipants.slice(0, 4);
  const hiddenParticipantsCount = Math.max(
    0,
    cardParticipants.length - visibleParticipants.length,
  );

  return (
    <Card
      component="li"
      variant="outlined"
      role="button"
      tabIndex={0}
      aria-label={`Открыть встречу «${meeting.title}»`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      sx={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        borderColor: "app.border.card",
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: (theme) => theme.appShadows.button,
        cursor: "pointer",
        transition: "background-color 150ms ease, box-shadow 150ms ease",
        "&:hover": { bgcolor: "action.hover" },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          gridTemplateColumns: {
            xs: "52px minmax(0, 1fr) 24px",
            lg: "64px minmax(0, 1fr) minmax(220px, 0.55fr) 24px",
          },
          alignItems: "center",
          gap: 1.25,
          p: 1.25,
          pb:
            cardParticipants.length > 0 || (online && Boolean(meeting.meetingUrl))
              ? 0.75
              : 1.25,
        }}
      >
        <Box
          sx={{
            display: "grid",
            width: { xs: 52, lg: 64 },
            height: { xs: 52, lg: 64 },
            alignSelf: "start",
            placeItems: "center",
            borderRadius: 2.5,
            bgcolor: typeStyle.surface,
            color: typeStyle.main,
            "& svg": { fontSize: { xs: 29, lg: 34 } },
          }}
        >
          {meeting.eventType === "WORK_MEETING" ? (
            <GroupsOutlined />
          ) : (
            <ForumOutlined />
          )}
        </Box>

        <Box sx={{ minWidth: 0, overflow: "hidden" }}>
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 750,
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            {meeting.title}
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
              sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}
            >
              <Box
                component="span"
                sx={{
                  display: "block",
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {formatDate(meeting.startsAt)} · {formatTime(meeting.startsAt)}–
                {formatTime(meeting.endsAt)}
              </Box>
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.55}
            sx={{ mt: 0.4, minWidth: 0, alignItems: "center" }}
          >
            {online ? (
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
                minWidth: 0,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {online ? "Онлайн" : `Аудитория ${meeting.room}`}
            </Typography>
          </Stack>

        </Box>

        <Stack
          direction="row"
          sx={{
            display: { xs: "none", lg: "flex" },
            minWidth: 0,
            alignSelf: "stretch",
            alignItems: "center",
            gap: 1.25,
            pl: 2,
          }}
        >
          <Avatar
            sx={[
              {
                width: 44,
                height: 44,
                flexShrink: 0,
                fontSize: "0.78rem",
                fontWeight: 750,
              },
              getAvatarColorSx(meeting.creator.avatarColor),
            ]}
          >
            {getParticipantInitials({
              name: meeting.creator.name,
              firstName: null,
              lastName: null,
            })}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Организатор
            </Typography>
            <Typography
              sx={{
                overflow: "hidden",
                fontWeight: 700,
                lineHeight: 1.25,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {meeting.creator.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.15 }}
            >
              {getOrganizerRoleLabel(meeting)}
            </Typography>
          </Box>
        </Stack>

        <ChevronRightRounded sx={{ color: "app.brand.accent" }} />
      </Box>

      {(cardParticipants.length > 0 ||
        (online && meeting.meetingUrl)) && (
        <Stack
          direction="row"
          sx={{
            minHeight: 38,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            pl: { xs: 9, lg: 10.5 },
            pr: 1.25,
            pb: 1.1,
          }}
        >
          <Stack direction="row" sx={{ minWidth: 0, alignItems: "center" }}>
            {visibleParticipants.map((participant, index) => (
              <Tooltip key={participant.id} title={participant.name}>
                <Avatar
                  sx={[
                    {
                      width: 28,
                      height: 28,
                      ml: index === 0 ? 0 : -0.75,
                      border: "2px solid",
                      borderColor:
                        participant.id === meeting.creator.id
                          ? "primary.main"
                          : "background.paper",
                      fontSize: "0.66rem",
                      fontWeight: 750,
                      zIndex:
                        participant.id === meeting.creator.id ? 2 : 1,
                    },
                    getAvatarColorSx(participant.avatarColor),
                  ]}
                >
                  {getParticipantInitials(participant)}
                </Avatar>
              </Tooltip>
            ))}
            {hiddenParticipantsCount > 0 && (
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  ml: -0.75,
                  border: "2px solid",
                  borderColor: "background.paper",
                  bgcolor: "app.background.field",
                  color: "text.secondary",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                }}
              >
                +{hiddenParticipantsCount}
              </Avatar>
            )}
          </Stack>

          {online && meeting.meetingUrl && (
            <Button
              component="a"
              href={meeting.meetingUrl}
              target="_blank"
              rel="noreferrer"
              variant="contained"
              size="small"
              onClick={(event) => event.stopPropagation()}
              sx={{ flexShrink: 0, borderRadius: 3, textTransform: "none" }}
            >
              Подключиться
            </Button>
          )}
        </Stack>
      )}
    </Card>
  );
};
