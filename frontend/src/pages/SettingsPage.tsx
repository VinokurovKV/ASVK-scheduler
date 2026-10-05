import { Box, CircularProgress, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../api/auth";
import { AUTH_QUERY_KEY } from "../api/authQuery";
import { AboutAppCard } from "../components/settings/AboutAppCard";
import { AccountSettingsCard } from "../components/settings/AccountSettingsCard";
import { AppearanceSettingsCard } from "../components/settings/AppearanceSettingsCard";
import { NotificationsSettingsCard } from "../components/settings/NotificationsSettingsCard";
import { SecuritySettingsCard } from "../components/settings/SecuritySettingsCard";

export const SettingsPage = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
  });

  if (isLoading || !user) {
    return (
      <Box
        sx={{
          display: "grid",
          minHeight: 240,
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        component="h1"
        sx={{
          display: { xs: "none", md: "block" },
          fontSize: { xs: "1.65rem", md: "2.125rem" },
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        Настройки
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ display: { xs: "none", md: "block" }, mt: 0.5 }}
      >
        Настройте внешний вид приложения, уведомления и параметры безопасности.
      </Typography>

      <Box
        sx={{
          display: { xs: "block", lg: "grid" },
          mt: { xs: 0, md: 2.5 },
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          alignItems: "stretch",
          gap: 2,
        }}
      >
        <AccountSettingsCard user={user} />
        <AppearanceSettingsCard />
      </Box>

      <Box
        sx={{
          display: { xs: "block", lg: "grid" },
          mt: { xs: 0, lg: 2 },
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          alignItems: "stretch",
          gap: 2,
        }}
      >
        <NotificationsSettingsCard />
        <SecuritySettingsCard />
      </Box>

      <AboutAppCard />
    </Box>
  );
};
