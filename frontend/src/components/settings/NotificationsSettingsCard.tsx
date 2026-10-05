import {
  GroupsOutlined,
  NotificationsNoneRounded,
} from "@mui/icons-material";
import { Box, Paper, Stack, Switch, Typography } from "@mui/material";
import { useState } from "react";

export const NotificationsSettingsCard = () => {
  const [eventRemindersEnabled, setEventRemindersEnabled] = useState(true);
  const [meetingNotificationsEnabled, setMeetingNotificationsEnabled] =
    useState(true);

  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{
        display: "block",
        mt: { xs: 1.5, lg: 0 },
        borderRadius: 3,
        boxShadow: (theme) => theme.appShadows.button,
        p: { xs: 1.5, md: 2.5 },
      }}
    >
      <Typography component="h2" sx={{ fontSize: "1rem", fontWeight: 750 }}>
        Уведомления
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: "none", md: "block" }, mt: 0.25 }}
      >
        Настройте, какие уведомления вы хотите получать.
      </Typography>

      <Stack sx={{ mt: { xs: 0.75, md: 1.5 } }}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            minHeight: { xs: 52, md: 64 },
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <NotificationsNoneRounded
            sx={{ flexShrink: 0, color: "app.brand.accent" }}
          />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
              Напоминания о событиях
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", md: "block" }, mt: 0.15 }}
            >
              Уведомления о начале занятий, встреч и мероприятий
            </Typography>
          </Box>

          <Switch
            checked={eventRemindersEnabled}
            onChange={(event) =>
              setEventRemindersEnabled(event.target.checked)
            }
            slotProps={{
              input: { "aria-label": "Напоминания о событиях" },
            }}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={1.25}
          sx={{ minHeight: { xs: 52, md: 64 }, alignItems: "center" }}
        >
          <GroupsOutlined sx={{ flexShrink: 0, color: "app.brand.accent" }} />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
              Уведомления о встречах
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", md: "block" }, mt: 0.15 }}
            >
              Приглашения и обновления по встречам
            </Typography>
          </Box>

          <Switch
            checked={meetingNotificationsEnabled}
            onChange={(event) =>
              setMeetingNotificationsEnabled(event.target.checked)
            }
            slotProps={{
              input: { "aria-label": "Уведомления о встречах" },
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
