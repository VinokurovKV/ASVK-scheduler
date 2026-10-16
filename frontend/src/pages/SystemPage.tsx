import {
  AdminPanelSettingsOutlined,
  GroupOutlined,
  KeyOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../api/auth";
import { AUTH_QUERY_KEY } from "../api/authQuery";
import {
  getSystemUsers,
  SYSTEM_USERS_QUERY_KEY,
  type SystemUser,
  updateSystemUserRoles,
} from "../api/system";
import type { AppRole, UserRole } from "../types/Auth";

const userRoleLabels: Record<UserRole, string> = {
  STUDENT: "Студент",
  POSTGRADUATE: "Аспирант",
  EMPLOYEE: "Сотрудник",
};

const getAcademicRoleLabel = (user: SystemUser) => {
  if (!user.role) {
    return "Роль не указана";
  }

  const role = userRoleLabels[user.role];

  return user.groupNumber ? `${role} · Группа ${user.groupNumber}` : role;
};

export const SystemPage = () => {
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
  });
  const isOwner = currentUser?.appRoles.includes("OWNER") === true;
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: SYSTEM_USERS_QUERY_KEY,
    queryFn: getSystemUsers,
    enabled: isOwner,
  });

  const updateRolesMutation = useMutation({
    mutationFn: ({
      userId,
      appRoles,
    }: {
      userId: number;
      appRoles: AppRole[];
    }) => updateSystemUserRoles(userId, appRoles),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData<SystemUser[]>(
        SYSTEM_USERS_QUERY_KEY,
        (current = []) =>
          current.map((user) =>
            user.id === updatedUser.id
              ? { ...user, appRoles: updatedUser.appRoles }
              : user,
          ),
      );

      if (updatedUser.id === currentUser?.id) {
        queryClient.setQueryData(AUTH_QUERY_KEY, (current: typeof currentUser) =>
          current ? { ...current, appRoles: updatedUser.appRoles } : current,
        );
      }
    },
  });

  if (isCurrentUserLoading) {
    return (
      <Box sx={{ display: "grid", minHeight: 240, placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isOwner) {
    return <Navigate to="/settings" replace />;
  }

  const toggleRole = (user: SystemUser, role: AppRole) => {
    const appRoles = user.appRoles.includes(role)
      ? user.appRoles.filter((currentRole) => currentRole !== role)
      : [...user.appRoles, role];

    updateRolesMutation.mutate({ userId: user.id, appRoles });
  };

  return (
    <Stack spacing={{ xs: 1.5, md: 2.5 }} sx={{ width: "100%", maxWidth: 1100, mx: "auto" }}>
      <Box>
        <Typography
          component="h1"
          sx={{
            display: { xs: "none", md: "block" },
            fontSize: "2.125rem",
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          Система
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ display: { xs: "none", md: "block" }, mt: 0.5 }}
        >
          Управление пользователями и правами доступа.
        </Typography>
      </Box>

      {updateRolesMutation.isError && (
        <Alert severity="error">
          Не удалось изменить статус. Последнего владельца системы удалить нельзя.
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: "grid", minHeight: 240, placeItems: "center" }}>
          <CircularProgress />
        </Box>
      )}

      {isError && <Alert severity="error">Не удалось загрузить пользователей</Alert>}

      {!isLoading && !isError && (
        <Box component="ul" sx={{ display: "grid", gap: 1.25, p: 0, m: 0, listStyle: "none" }}>
          {users.map((user) => {
            const isPending =
              updateRolesMutation.isPending &&
              updateRolesMutation.variables?.userId === user.id;

            return (
              <Card
                component="li"
                key={user.id}
                variant="outlined"
                sx={{
                  display: { md: "grid" },
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  alignItems: "center",
                  gap: 2,
                  p: { xs: 1.5, md: 2 },
                  borderColor: "app.border.card",
                  borderRadius: 3,
                }}
              >
                <Stack direction="row" sx={{ minWidth: 0, alignItems: "flex-start", gap: 1.25 }}>
                  <Box
                    sx={{
                      display: "grid",
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      placeItems: "center",
                      borderRadius: 2,
                      bgcolor: "app.brand.navySoft",
                      color: "app.brand.accent",
                    }}
                  >
                    <PersonOutlined />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" sx={{ flexWrap: "wrap", alignItems: "center", gap: 0.75 }}>
                      <Typography sx={{ fontWeight: 750, overflowWrap: "anywhere" }}>
                        {user.name}
                      </Typography>
                      {user.id === currentUser.id && (
                        <Chip label="Вы" size="small" color="primary" variant="outlined" />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {user.username ? `@${user.username}` : "Без логина"} · {user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.4 }}>
                      {getAcademicRoleLabel(user)} · Активных сессий: {user._count.sessions}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ mt: { xs: 1.5, md: 0 }, minWidth: { md: 330 } }}>
                  <Divider sx={{ display: { md: "none" }, mb: 1 }} />
                  <Stack direction="row" sx={{ flexWrap: "wrap", justifyContent: { md: "flex-end" }, gap: { xs: 0.5, sm: 1.5 } }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.appRoles.includes("GROUP_LEADER")}
                          onChange={() => toggleRole(user, "GROUP_LEADER")}
                          disabled={!user.groupNumber || isPending}
                        />
                      }
                      label={
                        <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                          <GroupOutlined fontSize="small" />
                          <span>Староста</span>
                        </Stack>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.appRoles.includes("OWNER")}
                          onChange={() => toggleRole(user, "OWNER")}
                          disabled={isPending}
                        />
                      }
                      label={
                        <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                          <KeyOutlined fontSize="small" />
                          <span>Владелец</span>
                        </Stack>
                      }
                    />
                  </Stack>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      <Alert icon={<AdminPanelSettingsOutlined />} severity="info">
        Староста может управлять событиями только своей группы. Владелец имеет доступ к системному разделу.
      </Alert>
    </Stack>
  );
};
