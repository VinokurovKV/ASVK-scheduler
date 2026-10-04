import {
  Close,
  DevicesOutlined,
  LogoutRounded,
  PowerSettingsNewOutlined,
  PriorityHighRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { logoutAllSessions } from "../../api/auth";
import { AUTH_QUERY_KEY } from "../../api/authQuery";

interface LogoutAllSessionsConfirmationProps {
  open: boolean;
  onClose: () => void;
}

export const LogoutAllSessionsConfirmation = ({
  open,
  onClose,
}: LogoutAllSessionsConfirmationProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down("md"));

  const logoutAllMutation = useMutation({
    mutationFn: logoutAllSessions,
    onSuccess: () => {
      onClose();
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      navigate("/login", { replace: true });
    },
  });

  const handleClose = () => {
    if (!logoutAllMutation.isPending) {
      onClose();
    }
  };

  const confirmationContent = (
    <Stack
      sx={{
        width: "100%",
        flex: { xs: 1, md: "initial" },
        alignItems: "center",
        pt: { xs: 0, md: 1 },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "grid",
            width: 72,
            height: 72,
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: "app.status.error.surface",
            color: "error.main",
          }}
        >
          <DevicesOutlined sx={{ fontSize: 42 }} />
        </Box>

        <Box
          sx={{
            position: "absolute",
            right: -5,
            bottom: -3,
            display: "grid",
            width: 28,
            height: 28,
            placeItems: "center",
            border: "3px solid",
            borderColor: "background.paper",
            borderRadius: "50%",
            bgcolor: "error.main",
            color: "common.white",
          }}
        >
          <LogoutRounded sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      <Typography
        id="logout-all-confirmation-title"
        sx={{ mt: { xs: 1.25, md: 1.5 }, fontSize: { xs: "1.05rem", md: "1.15rem" }, fontWeight: 750 }}
      >
        Выйти из всех сессий?
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: { xs: 0.5, md: 0.75 }, px: 2, textAlign: "center" }}
      >
        Вы завершите активные сессии на всех устройствах
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          width: "100%",
          minHeight: { xs: 52, md: 56 },
          mt: { xs: "auto", md: 2 },
          alignItems: "center",
          borderRadius: 3,
          bgcolor: "app.status.error.surface",
          color: "error.main",
          px: { xs: 1.25, md: 1.5 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            width: 28,
            height: 28,
            flexShrink: 0,
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
          }}
        >
          <PriorityHighRounded sx={{ fontSize: 19 }} />
        </Box>

        <Typography sx={{ fontSize: { xs: "0.78rem", md: "0.8rem" }, fontWeight: 600 }}>
          На этом устройстве тоже потребуется войти заново
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <>
      <Drawer
        anchor="bottom"
        open={isMobileViewport && open}
        onClose={handleClose}
        slotProps={{
          paper: {
            role: "dialog",
            "aria-modal": true,
            "aria-labelledby": "logout-all-confirmation-title",
            sx: {
              height: "46dvh",
              minHeight: 330,
              maxHeight: 420,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              px: 2,
              pt: 2.5,
              pb: "max(20px, env(safe-area-inset-bottom))",
            },
          },
        }}
      >
        <Stack sx={{ width: "100%", maxWidth: 440, height: "100%", mx: "auto" }}>
          {confirmationContent}

          <Stack spacing={1} sx={{ width: "100%", mt: "auto" }}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={<PowerSettingsNewOutlined />}
              disabled={logoutAllMutation.isPending}
              onClick={() => logoutAllMutation.mutate()}
              sx={{ minHeight: 44, borderRadius: 3.5 }}
            >
              Завершить все сессии
            </Button>

            <Button
              fullWidth
              disabled={logoutAllMutation.isPending}
              onClick={handleClose}
              sx={{
                minHeight: 44,
                borderRadius: 3.5,
                bgcolor: "app.background.field",
                color: "text.primary",
                "&:hover": { bgcolor: "app.background.field" },
              }}
            >
              Отмена
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      <Dialog
        open={!isMobileViewport && open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        aria-labelledby="logout-all-confirmation-title"
        slotProps={{
          paper: {
            sx: { position: "relative", maxWidth: 480, borderRadius: 4, p: 3 },
          },
        }}
      >
        <IconButton
          aria-label="Закрыть подтверждение завершения сессий"
          disabled={logoutAllMutation.isPending}
          onClick={handleClose}
          sx={{ position: "absolute", top: 12, right: 12, color: "text.secondary" }}
        >
          <Close />
        </IconButton>

        {confirmationContent}

        <Stack direction="row" spacing={1.5} sx={{ width: "100%", mt: 2 }}>
          <Button
            fullWidth
            disabled={logoutAllMutation.isPending}
            onClick={handleClose}
            sx={{
              minHeight: 44,
              borderRadius: 3.5,
              bgcolor: "app.background.field",
              color: "text.primary",
              "&:hover": { bgcolor: "app.background.field" },
            }}
          >
            Отмена
          </Button>

          <Button
            variant="contained"
            color="error"
            fullWidth
            startIcon={<PowerSettingsNewOutlined />}
            disabled={logoutAllMutation.isPending}
            onClick={() => logoutAllMutation.mutate()}
            sx={{ minHeight: 44, borderRadius: 3.5 }}
          >
            Завершить все сессии
          </Button>
        </Stack>
      </Dialog>
    </>
  );
};
