import { Close, FilterAltOutlined, Search } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getCurrentUser } from "../api/auth";
import { AUTH_QUERY_KEY } from "../api/authQuery";
import {
  getMeetings,
  MEETINGS_QUERY_KEY,
  type Meeting,
} from "../api/meetings";
import { EventDetailsDialog } from "../components/events/EventDetailsDialog";
import { MobileMeetingCard } from "../components/meetings/MobileMeetingCard";
import { getNextEventOccurrenceForEvent } from "./schedule/scheduleUtils";

type MeetingSection = "UPCOMING" | "INVITATIONS" | "PAST";
type FormatFilter = "ALL" | "OFFLINE" | "ONLINE";
type MeetingTypeFilter = "ALL" | "MEETING" | "WORK_MEETING";

const sectionLabels: Record<MeetingSection, string> = {
  UPCOMING: "Предстоящие",
  INVITATIONS: "Приглашения",
  PAST: "Прошедшие",
};

const formatLabels: Record<FormatFilter, string> = {
  ALL: "Все форматы",
  OFFLINE: "Очно",
  ONLINE: "Онлайн",
};

const meetingTypeLabels: Record<MeetingTypeFilter, string> = {
  ALL: "Все",
  MEETING: "Встречи",
  WORK_MEETING: "Совещания",
};

export const MeetingsPage = () => {
  const [section, setSection] = useState<MeetingSection>("UPCOMING");
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("ALL");
  const [meetingTypeFilter, setMeetingTypeFilter] =
    useState<MeetingTypeFilter>("ALL");
  const [onlyOrganizedByMe, setOnlyOrganizedByMe] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFormatFilter, setDraftFormatFilter] =
    useState<FormatFilter>("ALL");
  const [draftMeetingTypeFilter, setDraftMeetingTypeFilter] =
    useState<MeetingTypeFilter>("ALL");
  const [draftOnlyOrganizedByMe, setDraftOnlyOrganizedByMe] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [currentTime] = useState(() => Date.now());

  const { data: currentUser } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
  });
  const {
    data: meetings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: MEETINGS_QUERY_KEY,
    queryFn: getMeetings,
  });

  const meetingsWithOccurrences = useMemo(
    () =>
      meetings.map((meeting) => {
        if (meeting.repeatInterval === "NONE") {
          return meeting;
        }

        return (
          (getNextEventOccurrenceForEvent(
            meeting,
            new Date(currentTime),
          ) as Meeting | null) ?? meeting
        );
      }),
    [currentTime, meetings],
  );

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ru-RU");
  const filteredMeetings = meetingsWithOccurrences
    .filter((meeting) => {
      const endTime = new Date(meeting.endsAt).getTime();
      const pending = meeting.participationStatus === "PENDING";
      const matchesSection =
        section === "INVITATIONS"
          ? pending && endTime >= currentTime
          : section === "UPCOMING"
            ? !pending && endTime >= currentTime
            : !pending && endTime < currentTime;
      const searchableText = [
        meeting.title,
        meeting.description,
        meeting.room,
        meeting.creator.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ru-RU");

      return (
        matchesSection &&
        (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
        (formatFilter === "ALL" || meeting.format === formatFilter) &&
        (meetingTypeFilter === "ALL" ||
          meeting.eventType === meetingTypeFilter) &&
        (!onlyOrganizedByMe || meeting.creatorId === currentUser?.id)
      );
    })
    .sort((first, second) => {
      const difference =
        new Date(first.startsAt).getTime() -
        new Date(second.startsAt).getTime();

      return section === "PAST" ? -difference : difference;
    });

  const hasActiveFilters =
    formatFilter !== "ALL" ||
    meetingTypeFilter !== "ALL" ||
    onlyOrganizedByMe;

  const openFilters = () => {
    setDraftFormatFilter(formatFilter);
    setDraftMeetingTypeFilter(meetingTypeFilter);
    setDraftOnlyOrganizedByMe(onlyOrganizedByMe);
    setFiltersOpen(true);
  };

  return (
    <>
      <Stack
        spacing={1.5}
        sx={{
          display: { xs: "flex", lg: "none" },
          width: "100%",
          minWidth: 0,
          overflowX: "hidden",
        }}
      >
        <Typography variant="h4" sx={{ fontSize: "1.75rem", fontWeight: 700 }}>
          Встречи
        </Typography>

        <Stack direction="row" sx={{ gap: 0.75 }}>
          {(Object.keys(sectionLabels) as MeetingSection[]).map((value) => (
            <Chip
              key={value}
              label={sectionLabels[value]}
              clickable
              color={section === value ? "primary" : "default"}
              variant={section === value ? "filled" : "outlined"}
              onClick={() => setSection(value)}
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.68rem",
                fontWeight: 650,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          ))}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 42px",
            gap: 1,
          }}
        >
          <TextField
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск по названию или организатору"
            size="small"
            fullWidth
            slotProps={{
              htmlInput: { inputMode: "search", enterKeyHint: "search" },
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
              "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
            }}
          />

          <IconButton
            aria-label="Открыть фильтры"
            onClick={openFilters}
            sx={{
              width: 42,
              height: 40,
              border: "1px solid",
              borderColor: hasActiveFilters ? "primary.main" : "app.border.field",
              borderRadius: 2.5,
              bgcolor: hasActiveFilters ? "primary.main" : "background.paper",
              color: hasActiveFilters ? "primary.contrastText" : "text.secondary",
            }}
          >
            <FilterAltOutlined />
          </IconButton>
        </Box>

        <Drawer
          anchor="bottom"
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          slotProps={{
            paper: {
              sx: {
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                bgcolor: "background.paper",
              },
            },
          }}
        >
          <Stack
            spacing={2.25}
            sx={{
              width: "100%",
              maxWidth: 600,
              mx: "auto",
              p: 2,
              pb: "calc(16px + env(safe-area-inset-bottom))",
            }}
          >
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Фильтры
              </Typography>
              <IconButton
                aria-label="Закрыть фильтры"
                onClick={() => setFiltersOpen(false)}
              >
                <Close />
              </IconButton>
            </Stack>

            <Divider />

            <Box>
              <Typography sx={{ mb: 1, fontWeight: 650 }}>
                Тип встречи
              </Typography>
              <ToggleButtonGroup
                value={draftMeetingTypeFilter}
                exclusive
                fullWidth
                size="small"
                onChange={(_, value: MeetingTypeFilter | null) => {
                  if (value) setDraftMeetingTypeFilter(value);
                }}
              >
                {(Object.keys(meetingTypeLabels) as MeetingTypeFilter[]).map(
                  (value) => (
                    <ToggleButton key={value} value={value}>
                      {meetingTypeLabels[value]}
                    </ToggleButton>
                  ),
                )}
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography sx={{ mb: 1, fontWeight: 650 }}>Формат</Typography>
              <ToggleButtonGroup
                value={draftFormatFilter}
                exclusive
                fullWidth
                size="small"
                onChange={(_, value: FormatFilter | null) => {
                  if (value) setDraftFormatFilter(value);
                }}
              >
                {(Object.keys(formatLabels) as FormatFilter[]).map((value) => (
                  <ToggleButton key={value} value={value}>
                    {formatLabels[value]}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={draftOnlyOrganizedByMe}
                  onChange={(event) =>
                    setDraftOnlyOrganizedByMe(event.target.checked)
                  }
                />
              }
              label="Только организованные мной"
              sx={{ mx: 0 }}
            />

            <Stack direction="row" spacing={1.25}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setDraftFormatFilter("ALL");
                  setDraftMeetingTypeFilter("ALL");
                  setDraftOnlyOrganizedByMe(false);
                }}
              >
                Сбросить
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setFormatFilter(draftFormatFilter);
                  setMeetingTypeFilter(draftMeetingTypeFilter);
                  setOnlyOrganizedByMe(draftOnlyOrganizedByMe);
                  setFiltersOpen(false);
                }}
              >
                Применить
              </Button>
            </Stack>
          </Stack>
        </Drawer>

        {isLoading && (
          <Box sx={{ display: "grid", minHeight: 240, placeItems: "center" }}>
            <CircularProgress />
          </Box>
        )}
        {isError && <Alert severity="error">Не удалось загрузить встречи</Alert>}
        {!isLoading && !isError && filteredMeetings.length === 0 && (
          <Box
            sx={{
              display: "grid",
              minHeight: 180,
              placeItems: "center",
              px: 2,
              border: "1px solid",
              borderColor: "app.border.card",
              borderRadius: 3,
              bgcolor: "background.paper",
            }}
          >
            <Typography color="text.secondary" sx={{ textAlign: "center" }}>
              {section === "INVITATIONS"
                ? "Новых приглашений пока нет"
                : section === "PAST"
                  ? "Прошедших встреч пока нет"
                  : "Предстоящих встреч пока нет"}
            </Typography>
          </Box>
        )}
        {!isLoading && !isError && filteredMeetings.length > 0 && (
          <Box
            component="ul"
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              width: "100%",
              minWidth: 0,
              gap: 1,
              p: 0,
              m: 0,
              listStyle: "none",
            }}
          >
            {filteredMeetings.map((meeting) => (
              <MobileMeetingCard
                key={meeting.id}
                meeting={meeting}
                onOpen={() => setSelectedMeeting(meeting)}
              />
            ))}
          </Box>
        )}
      </Stack>

      <Typography
        variant="h4"
        sx={{ display: { xs: "none", lg: "block" }, fontWeight: 700 }}
      >
        Встречи
      </Typography>

      {selectedMeeting && (
        <EventDetailsDialog
          event={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onEventUpdated={(event) => {
            if (
              event.eventType !== "MEETING" &&
              event.eventType !== "WORK_MEETING"
            ) {
              setSelectedMeeting(null);
              return;
            }

            setSelectedMeeting({
              ...selectedMeeting,
              ...event,
              eventType: event.eventType,
            });
          }}
        />
      )}
    </>
  );
};
