import { Close, Logout } from "@mui/icons-material";
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

interface LogoutConfirmationProps {
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmation = ({
  open,
  pending,
  onClose,
  onConfirm,
}: LogoutConfirmationProps) => {
  const theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down("md"));

  const handleClose = () => {
    if (!pending) {
      onClose();
    }
  };

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
            "aria-labelledby": "logout-confirmation-title",
            sx: {
              height: "38dvh",
              minHeight: 270,
              maxHeight: 340,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
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
            alignItems: "center",
          }}
        >
          <LogoutIcon />

          <Typography
            id="logout-confirmation-title"
            sx={{ mt: 1.25, fontSize: "1.05rem", fontWeight: 750 }}
          >
            Выйти из аккаунта?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, px: 2, textAlign: "center" }}
          >
            Вы уверены, что хотите выйти из текущей сессии?
          </Typography>

          <Stack spacing={1} sx={{ width: "100%", mt: "auto" }}>
            <ConfirmButton pending={pending} onConfirm={onConfirm} />
            <CancelButton pending={pending} onClose={onClose} />
          </Stack>
        </Stack>
      </Drawer>

      <Dialog
        open={!isMobileViewport && open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        aria-labelledby="desktop-logout-confirmation-title"
        slotProps={{
          paper: {
            sx: { position: "relative", maxWidth: 460, borderRadius: 4, p: 3 },
          },
        }}
      >
        <IconButton
          aria-label="Закрыть подтверждение выхода"
          disabled={pending}
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "text.secondary",
          }}
        >
          <Close />
        </IconButton>

        <Stack sx={{ alignItems: "center", pt: 1 }}>
          <LogoutIcon />

          <Typography
            id="desktop-logout-confirmation-title"
            sx={{ mt: 1.5, fontSize: "1.15rem", fontWeight: 750 }}
          >
            Выйти из аккаунта?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.75, textAlign: "center" }}
          >
            Вы уверены, что хотите выйти из текущей сессии?
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: (theme) =>
                theme.alpha(theme.vars.palette.text.primary, 0.35),
              fontFamily: (theme) => theme.typography.body1.fontFamily,
              fontSize: "0.75rem",
              textAlign: "center",
            }}
          >
            Вы снова сможете войти в любой момент
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ width: "100%", mt: 3 }}>
            <CancelButton pending={pending} onClose={onClose} />
            <ConfirmButton pending={pending} onConfirm={onConfirm} />
          </Stack>
        </Stack>
      </Dialog>
    </>
  );
};

const LogoutIcon = () => (
  <Box
    sx={{
      display: "grid",
      width: 72,
      height: 72,
      flexShrink: 0,
      placeItems: "center",
      borderRadius: "50%",
      bgcolor: "app.status.error.surface",
      color: "error.main",
    }}
  >
    <Logout sx={{ fontSize: 44 }} />
  </Box>
);

interface ActionButtonProps {
  pending: boolean;
}

const CancelButton = ({
  pending,
  onClose,
}: ActionButtonProps & { onClose: () => void }) => (
  <Button
    fullWidth
    disabled={pending}
    onClick={onClose}
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
);

const ConfirmButton = ({
  pending,
  onConfirm,
}: ActionButtonProps & { onConfirm: () => void }) => (
  <Button
    variant="contained"
    color="error"
    fullWidth
    startIcon={<Logout />}
    disabled={pending}
    onClick={onConfirm}
    sx={{ minHeight: 44, borderRadius: 3.5 }}
  >
    Выйти
  </Button>
);
