import {
  ChevronRight,
  DesktopWindowsOutlined,
  LaptopMacOutlined,
  PowerSettingsNewOutlined,
  SmartphoneOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

import { getActiveSessions } from "../api/auth";
import { LogoutAllSessionsConfirmation } from "../components/auth/LogoutAllSessionsConfirmation";
import type { AuthSessionInfo, SessionDeviceType } from "../types/Auth";

const ACTIVE_SESSIONS_QUERY_KEY = ["auth", "sessions"] as const;

const deviceIcons: Record<SessionDeviceType, ReactNode> = {
  PHONE: <SmartphoneOutlined />,
  LAPTOP: <LaptopMacOutlined />,
  DESKTOP: <DesktopWindowsOutlined />,
};

const getDevicePresentation = (session: AuthSessionInfo) => {
  const [deviceName, browser] = session.deviceName.split(" · ");

  const operatingSystem = (() => {
    if (deviceName === "iPhone") return "iOS";
    if (deviceName === "iPad") return "iPadOS";
    if (deviceName === "Android") return "Android";
    if (deviceName === "Mac") return "macOS";
    if (deviceName === "Windows PC") return "Windows";
    if (deviceName === "Linux PC") return "Linux";

    return "Неизвестная ОС";
  })();

  return {
    deviceName,
    details: browser ? `${operatingSystem} · ${browser}` : operatingSystem,
  };
};

const formatLastActive = (value: string, online: boolean) => {
  if (online) {
    return "Сейчас в сети";
  }

  const date = new Date(value);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfActivityDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDifference = Math.round(
    (startOfToday.getTime() - startOfActivityDay.getTime()) / 86_400_000,
  );
  const time = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  if (dayDifference === 0) {
    return `Сегодня, ${time}`;
  }

  if (dayDifference === 1) {
    return `Вчера, ${time}`;
  }

  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return formattedDate;
};

const SessionCard = ({ session }: { session: AuthSessionInfo }) => {
  const device = getDevicePresentation(session);

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        minHeight: 98,
        alignItems: "center",
        borderColor: (theme) => alpha(theme.palette.app.brand.navy, 0.07),
        borderRadius: 3,
        boxShadow: "none",
        gap: 1.5,
        px: { xs: 1.5, md: 2 },
        py: { xs: 1.35, md: 1.5 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          width: 52,
          height: 52,
          flexShrink: 0,
          placeItems: "center",
          borderRadius: 2.5,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          color: "app.brand.navy",
          "& svg": { fontSize: 30 },
        }}
      >
        {deviceIcons[session.deviceType]}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            overflow: "hidden",
            fontSize: "0.96rem",
            fontWeight: 700,
            lineHeight: 1.25,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {device.deviceName}
        </Typography>

        <Typography
          sx={{
            mt: 0.25,
            color: "text.secondary",
            fontSize: "0.74rem",
            lineHeight: 1.3,
          }}
        >
          {device.details}
        </Typography>

        <Typography
          sx={{
            mt: 0.25,
            color: session.online
              ? "app.status.success.text"
              : "text.secondary",
            fontSize: "0.72rem",
            fontWeight: session.online ? 650 : 400,
            lineHeight: 1.3,
          }}
        >
          {formatLastActive(session.lastActiveAt, session.online)}
        </Typography>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          borderRadius: 2,
          bgcolor: session.current
            ? (theme) => alpha(theme.palette.primary.main, 0.08)
            : "app.status.error.surface",
          color: session.current ? "primary.main" : "error.main",
          fontSize: "0.72rem",
          fontWeight: 700,
          lineHeight: 1,
          px: 1.1,
          py: 0.8,
        }}
      >
        {session.current ? "Текущее" : "Выйти"}
      </Box>
    </Paper>
  );
};

export const ActiveSessionsPage = () => {
  const [isLogoutAllConfirmationOpen, setIsLogoutAllConfirmationOpen] =
    useState(false);
  const sessionsQuery = useQuery({
    queryKey: ACTIVE_SESSIONS_QUERY_KEY,
    queryFn: getActiveSessions,
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        component="h1"
        sx={{
          display: { xs: "none", md: "block" },
          mb: 0,
          fontSize: "2.125rem",
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        Активные сессии
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          display: { xs: "none", md: "block" },
          mt: 0.5,
          mb: 2.5,
          fontSize: "0.95rem",
        }}
      >
        Здесь отображаются устройства, на которых выполнен вход в ваш аккаунт.
      </Typography>

      {sessionsQuery.isPending ? (
        <Box sx={{ display: "grid", minHeight: 180, placeItems: "center" }}>
          <CircularProgress size={30} />
        </Box>
      ) : sessionsQuery.isError ? (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, boxShadow: "none", py: 4 }}
        >
          <Stack spacing={1.25} sx={{ alignItems: "center" }}>
            <Typography color="text.secondary" sx={{ textAlign: "center" }}>
              Не удалось загрузить активные сессии
            </Typography>
            <Button onClick={() => sessionsQuery.refetch()}>Повторить</Button>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={1.25}>
          {sessionsQuery.data.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </Stack>
      )}

      <Button
        fullWidth
        startIcon={<PowerSettingsNewOutlined />}
        endIcon={<ChevronRight />}
        onClick={() => setIsLogoutAllConfirmationOpen(true)}
        sx={{
          display: { xs: "flex", md: "none" },
          justifyContent: "flex-start",
          minHeight: 68,
          mt: 1.25,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.error.main, 0.08),
          borderRadius: 3,
          bgcolor: "app.status.error.surface",
          color: "error.main",
          fontSize: "0.86rem",
          fontWeight: 650,
          px: 1.5,
          textTransform: "none",
          "&:hover": { bgcolor: "app.status.error.surface" },
          "& .MuiButton-startIcon": { flexShrink: 0 },
          "& .MuiButton-endIcon": { flexShrink: 0, ml: "auto" },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1, textAlign: "left" }}>
          <Typography sx={{ fontSize: "0.86rem", fontWeight: 650 }}>
            Выйти из всех устройств
          </Typography>

          <Typography
            variant="caption"
            sx={{
              mt: 0.2,
              color: "text.secondary",
              fontSize: "0.65rem !important",
              fontWeight: 400,
              lineHeight: 1.25,
            }}
          >
            Будут завершены все активные сессии, включая текущую
          </Typography>
        </Box>
      </Button>

      <Paper
        variant="outlined"
        sx={{
          display: { xs: "none", md: "flex" },
          minHeight: 84,
          mt: 1.5,
          alignItems: "center",
          borderColor: (theme) => alpha(theme.palette.error.main, 0.08),
          borderRadius: 3,
          boxShadow: "none",
          bgcolor: "app.status.error.surface",
          gap: 1.5,
          px: 2,
          py: 1.5,
        }}
      >
        <Box
          sx={{
            display: "grid",
            width: 44,
            height: 44,
            flexShrink: 0,
            placeItems: "center",
            borderRadius: 2.5,
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            color: "error.main",
          }}
        >
          <PowerSettingsNewOutlined />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
            Завершить все сессии
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.2, fontSize: "0.75rem", lineHeight: 1.3 }}
          >
            Будут завершены все активные сессии, включая текущую
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="error"
          startIcon={<PowerSettingsNewOutlined />}
          onClick={() => setIsLogoutAllConfirmationOpen(true)}
          sx={{ minHeight: 42, flexShrink: 0, borderRadius: 2.5, px: 2 }}
        >
          Выйти из всех устройств
        </Button>
      </Paper>

      <LogoutAllSessionsConfirmation
        open={isLogoutAllConfirmationOpen}
        onClose={() => setIsLogoutAllConfirmationOpen(false)}
      />
    </Box>
  );
};
