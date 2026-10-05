import { Close, LogoutRounded } from "@mui/icons-material";
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
import { useTheme } from "@mui/material/styles";

interface LogoutSessionConfirmationProps {
  open: boolean;
  deviceName: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutSessionConfirmation = ({
  open,
  deviceName,
  isPending,
  onClose,
  onConfirm,
}: LogoutSessionConfirmationProps) => {
  const theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down("md"));

  const handleClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  const confirmationContent = (
    <Stack sx={{ width: "100%", alignItems: "center" }}>
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
        <LogoutRounded sx={{ fontSize: 42 }} />
      </Box>

      <Typography
        id="logout-session-confirmation-title"
        sx={{
          mt: 1.5,
          fontSize: { xs: "1.05rem", md: "1.15rem" },
          fontWeight: 750,
          textAlign: "center",
        }}
      >
        Завершить эту сессию?
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.75, px: 2, textAlign: "center" }}
      >
        На устройстве «{deviceName}» потребуется войти в аккаунт заново
      </Typography>
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
            "aria-labelledby": "logout-session-confirmation-title",
            sx: {
              minHeight: 330,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              px: 2,
              pt: 2.5,
              pb: "max(20px, env(safe-area-inset-bottom))",
            },
          },
        }}
      >
        <Stack
          sx={{
            width: "100%",
            maxWidth: 440,
            height: "100%",
            mx: "auto",
          }}
        >
          {confirmationContent}

          <Stack spacing={1} sx={{ width: "100%", mt: "auto" }}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={<LogoutRounded />}
              disabled={isPending}
              onClick={onConfirm}
              sx={{ minHeight: 44, borderRadius: 3.5 }}
            >
              Завершить сессию
            </Button>

            <Button
              fullWidth
              disabled={isPending}
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
        aria-labelledby="logout-session-confirmation-title"
        slotProps={{
          paper: {
            sx: { position: "relative", maxWidth: 480, borderRadius: 4, p: 3 },
          },
        }}
      >
        <IconButton
          aria-label="Закрыть подтверждение завершения сессии"
          disabled={isPending}
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "text.secondary",
          }}
        >
          <Close />
        </IconButton>

        {confirmationContent}

        <Stack direction="row" spacing={1.5} sx={{ width: "100%", mt: 3 }}>
          <Button
            fullWidth
            disabled={isPending}
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
            startIcon={<LogoutRounded />}
            disabled={isPending}
            onClick={onConfirm}
            sx={{ minHeight: 44, borderRadius: 3.5 }}
          >
            Завершить сессию
          </Button>
        </Stack>
      </Dialog>
    </>
  );
};
