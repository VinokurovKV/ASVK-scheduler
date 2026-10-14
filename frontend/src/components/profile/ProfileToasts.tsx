import { Alert, Box, Stack } from "@mui/material";

import type { ProfileErrorToast } from "./profileTypes";

interface ProfileToastsProps {
  errors: ProfileErrorToast[];
  successOpen: boolean;
  onErrorClose: (id: number) => void;
  onSuccessClose: () => void;
}

export const ProfileToasts = ({
  errors,
  successOpen,
  onErrorClose,
  onSuccessClose,
}: ProfileToastsProps) => (
  <Box
    sx={{
      position: "fixed",
      left: "50%",
      bottom: 16,
      zIndex: 2000,
      width: "calc(100% - 32px)",
      maxWidth: 440,
      transform: "translateX(-50%)",
      pointerEvents: "none",
    }}
  >
    <Stack spacing={1}>
      {errors.map((toast) => (
        <Alert
          key={toast.id}
          severity="error"
          variant="filled"
          onClose={() => onErrorClose(toast.id)}
          sx={{
            width: "100%",
            boxShadow: (theme) => theme.appShadows.toast,
            pointerEvents: "auto",
          }}
        >
          {toast.message}
        </Alert>
      ))}

      {successOpen && (
        <Alert
          severity="success"
          variant="filled"
          onClose={onSuccessClose}
          sx={{
            width: "100%",
            boxShadow: (theme) => theme.appShadows.toast,
            pointerEvents: "auto",
          }}
        >
          Профиль успешно обновлён
        </Alert>
      )}
    </Stack>
  </Box>
);
