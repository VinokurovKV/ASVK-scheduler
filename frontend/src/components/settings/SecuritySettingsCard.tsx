import {
  ChevronRightRounded,
  DevicesOutlined,
  LockOutlined,
  PowerSettingsNewOutlined,
} from "@mui/icons-material";
import { Box, ButtonBase, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { LogoutAllSessionsConfirmation } from "../auth/LogoutAllSessionsConfirmation";

export const SecuritySettingsCard = () => {
  const navigate = useNavigate();
  const [isLogoutAllConfirmationOpen, setIsLogoutAllConfirmationOpen] =
    useState(false);

  return (
    <>
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
          Безопасность
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: { xs: "none", md: "block" }, mt: 0.25 }}
        >
          Защитите свой аккаунт и управляйте активными сессиями.
        </Typography>

        <Stack sx={{ mt: { xs: 0.75, md: 1.5 } }}>
          <ButtonBase
            onClick={() =>
              navigate("/settings/password", {
                state: { from: "/settings" },
              })
            }
            sx={{
              display: "flex",
              minHeight: { xs: 52, md: 64 },
              width: "100%",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "app.border.card",
              borderRadius: 2,
              gap: 1.25,
              px: { xs: 1, md: 1.5 },
              textAlign: "left",
            }}
          >
            <LockOutlined sx={{ flexShrink: 0, color: "app.brand.accent" }} />

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
                Изменить пароль
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: { xs: "none", md: "block" }, mt: 0.15 }}
              >
                Обновите пароль для своего аккаунта
              </Typography>
            </Box>

            <ChevronRightRounded color="action" />
          </ButtonBase>

          <ButtonBase
            onClick={() =>
              navigate("/settings/sessions", {
                state: { from: "/settings" },
              })
            }
            sx={{
              display: "flex",
              minHeight: { xs: 52, md: 64 },
              width: "100%",
              mt: 0.75,
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "app.border.card",
              borderRadius: 2,
              gap: 1.25,
              px: { xs: 1, md: 1.5 },
              textAlign: "left",
            }}
          >
            <DevicesOutlined
              sx={{ flexShrink: 0, color: "app.brand.accent" }}
            />

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
                Активные сессии
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: { xs: "none", md: "block" }, mt: 0.15 }}
              >
                Управление устройствами, где выполнен вход
              </Typography>
            </Box>

            <ChevronRightRounded color="action" />
          </ButtonBase>

          <ButtonBase
            onClick={() => setIsLogoutAllConfirmationOpen(true)}
            sx={{
              display: "flex",
              minHeight: { xs: 52, md: 64 },
              width: "100%",
              mt: 0.75,
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: (theme) =>
                theme.alpha(theme.vars.palette.error.main, 0.08),
              borderRadius: 2,
              bgcolor: "app.status.error.surface",
              color: "error.main",
              gap: 1.25,
              px: { xs: 1, md: 1.5 },
              opacity: 1,
              textAlign: "left",
              "&.Mui-disabled": { opacity: 1, color: "error.main" },
            }}
          >
            <PowerSettingsNewOutlined sx={{ flexShrink: 0 }} />

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
                Выйти из всех устройств
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display: { xs: "none", md: "block" },
                  mt: 0.15,
                  color: "error.main",
                  opacity: 0.75,
                }}
              >
                Завершить все активные сессии
              </Typography>
            </Box>

            <ChevronRightRounded />
          </ButtonBase>
        </Stack>
      </Paper>

      <LogoutAllSessionsConfirmation
        open={isLogoutAllConfirmationOpen}
        onClose={() => setIsLogoutAllConfirmationOpen(false)}
      />
    </>
  );
};
