import { Avatar, Autocomplete, Box, Stack, TextField, Typography, createFilterOptions } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { getCurrentUser } from "../../api/auth";
import { AUTH_QUERY_KEY } from "../../api/authQuery";
import { createMeeting } from "../../api/meetings";
import {
  getUsers,
  USERS_QUERY_KEY,
  type PublicUser,
} from "../../api/users";
import {
  EventFormDialog,
  type EventFormValues,
} from "../events/EventFormDialog";

interface CreateMeetingDialogProps {
  open: boolean;
  initialDate: Date;
  onClose: () => void;
}

const userFilter = createFilterOptions<PublicUser>({
  stringify: (user) =>
    [user.name, user.username, user.groupNumber].filter(Boolean).join(" "),
});

const getInitials = (user: PublicUser) => {
  const firstInitial = user.firstName?.charAt(0);
  const lastInitial = user.lastName?.charAt(0);

  if (firstInitial || lastInitial) {
    return `${firstInitial ?? ""}${lastInitial ?? ""}`.toUpperCase();
  }

  return user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

const getUserDetails = (user: PublicUser) => {
  if (user.role === "STUDENT") {
    return user.groupNumber ? `Студент · Группа ${user.groupNumber}` : "Студент";
  }

  if (user.role === "POSTGRADUATE") return "Аспирант";
  if (user.role === "EMPLOYEE") return "Сотрудник";

  return user.username ? `@${user.username}` : "Пользователь";
};

export const CreateMeetingDialog = ({
  open,
  initialDate,
  onClose,
}: CreateMeetingDialogProps) => {
  const queryClient = useQueryClient();
  const [participants, setParticipants] = useState<PublicUser[]>([]);
  const { data: currentUser } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
  });
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: getUsers,
  });
  const start = new Date(initialDate);
  start.setHours(10, 0, 0, 0);
  const end = new Date(initialDate);
  end.setHours(11, 0, 0, 0);

  const createMeetingMutation = useMutation({
    mutationFn: (values: EventFormValues) =>
      createMeeting({
        title: values.title,
        description: values.description || undefined,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        eventType:
          values.eventType === "WORK_MEETING" ? "WORK_MEETING" : "MEETING",
        format: values.format,
        repeatInterval: values.repeatInterval,
        room: values.room,
        meetingUrl: values.meetingUrl,
        participantIds: participants.map((participant) => participant.id),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["events"] }),
        queryClient.invalidateQueries({ queryKey: ["meetings"] }),
      ]);
      onClose();
    },
  });

  return (
    <EventFormDialog
      open={open}
      heading="Новая встреча"
      submitLabel="Создать встречу"
      pendingLabel="Создание..."
      errorMessage="Не удалось создать встречу"
      initialValues={{
        title: "",
        description: "",
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        eventType: "MEETING",
        format: "OFFLINE",
        repeatInterval: "NONE",
        room: "",
        meetingUrl: "",
      }}
      additionalField={
        <Autocomplete
          multiple
          options={users.filter((user) => user.id !== currentUser?.id)}
          value={participants}
          loading={usersLoading}
          filterOptions={userFilter}
          getOptionLabel={(user) => user.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_, value) => setParticipants(value)}
          noOptionsText="Пользователи не найдены"
          loadingText="Загрузка пользователей..."
          renderOption={(props, user) => {
            const { key, ...optionProps } = props;

            return (
              <Box
                component="li"
                key={key}
                {...optionProps}
                sx={{ display: "flex", gap: 1.25 }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "app.brand.navySoft",
                    color: "app.brand.accent",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {getInitials(user)}
                </Avatar>
                <Stack sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 650 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getUserDetails(user)}
                  </Typography>
                </Stack>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Участники"
              placeholder={participants.length === 0 ? "Найдите пользователя" : ""}
            />
          )}
        />
      }
      eventTypeOptions={[
        { value: "MEETING", label: "Встреча" },
        { value: "WORK_MEETING", label: "Совещание" },
      ]}
      isPending={createMeetingMutation.isPending}
      isError={createMeetingMutation.isError}
      onSubmit={(values) => createMeetingMutation.mutate(values)}
      onClose={onClose}
    />
  );
};
