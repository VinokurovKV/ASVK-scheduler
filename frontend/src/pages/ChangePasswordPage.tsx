import {
  InfoOutlined,
  LockResetOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";

import { AuthApiError, changePassword } from "../api/auth";

interface ToastState {
  severity: "success" | "error";
  message: string;
}

const getErrorMessage = (error: unknown) => {
  if (!(error instanceof AuthApiError)) {
    return "Не удалось изменить пароль";
  }

  switch (error.message) {
    case "Current password is incorrect":
      return "Текущий пароль указан неверно";
    case "Password must contain at least 8 characters":
      return "Новый пароль должен содержать не менее 8 символов";
    case "Password must contain at most 128 characters":
      return "Новый пароль должен содержать не более 128 символов";
    case "New password must be different from the current password":
      return "Новый пароль должен отличаться от текущего";
    default:
      return "Не удалось изменить пароль";
  }
};

export const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [currentPasswordRejected, setCurrentPasswordRejected] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 3000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
      setWasSubmitted(false);
      setCurrentPasswordRejected(false);
      setToast({ severity: "success", message: "Пароль успешно изменён" });
    },
    onError: (error) => {
      if (
        error instanceof AuthApiError &&
        error.message === "Current password is incorrect"
      ) {
        setCurrentPasswordRejected(true);
      }

      setToast({ severity: "error", message: getErrorMessage(error) });
    },
  });

  const currentPasswordError =
    (wasSubmitted && !currentPassword) || currentPasswordRejected;
  const newPasswordError =
    wasSubmitted &&
    (newPassword.length < 8 ||
      newPassword.length > 128 ||
      newPassword === currentPassword);
  const confirmationError =
    wasSubmitted && passwordConfirmation !== newPassword;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWasSubmitted(true);
    setCurrentPasswordRejected(false);

    if (
      !currentPassword ||
      newPassword.length < 8 ||
      newPassword.length > 128 ||
      newPassword === currentPassword ||
      passwordConfirmation !== newPassword
    ) {
      return;
    }

    mutation.mutate({ currentPassword, newPassword });
  };

  const handleReset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setPasswordConfirmation("");
    setCurrentPasswordVisible(false);
    setNewPasswordVisible(false);
    setConfirmationVisible(false);
    setWasSubmitted(false);
    setCurrentPasswordRejected(false);
    setToast(null);
    mutation.reset();
  };

  const passwordAdornment = (
    visible: boolean,
    toggleVisibility: () => void,
    label: string,
  ) => (
    <InputAdornment position="end">
      <IconButton edge="end" onClick={toggleVisibility} aria-label={label}>
        {visible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        component="h1"
        sx={{
          display: { xs: "none", md: "block" },
          fontSize: "2.125rem",
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        Смена пароля
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
        Установите новый пароль для защиты вашего аккаунта.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "app.border.card",
          borderRadius: 3,
          maxWidth: { md: 700 },
          mx: { md: "auto" },
          p: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Box
          component="form"
          id="change-password-form"
          noValidate
          onSubmit={handleSubmit}
          sx={{ width: "100%", maxWidth: 600, mx: { md: "auto" } }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <LockResetOutlined sx={{ color: "app.brand.accent" }} />
            <Typography sx={{ fontSize: "1rem", fontWeight: 750 }}>
              Новый пароль
            </Typography>
          </Stack>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Текущий пароль"
              type={currentPasswordVisible ? "text" : "password"}
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setCurrentPasswordRejected(false);
              }}
              autoComplete="current-password"
              error={currentPasswordError}
              helperText={
                currentPasswordRejected
                  ? "Текущий пароль указан неверно"
                  : wasSubmitted && !currentPassword
                    ? "Введите текущий пароль"
                    : " "
              }
              fullWidth
              slotProps={{
                input: {
                  endAdornment: passwordAdornment(
                    currentPasswordVisible,
                    () => setCurrentPasswordVisible((visible) => !visible),
                    currentPasswordVisible
                      ? "Скрыть текущий пароль"
                      : "Показать текущий пароль",
                  ),
                },
              }}
            />

            <TextField
              label="Новый пароль"
              type={newPasswordVisible ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              error={newPasswordError}
              helperText={
                wasSubmitted && newPassword.length < 8
                  ? "Пароль должен содержать не менее 8 символов"
                  : wasSubmitted && newPassword.length > 128
                    ? "Пароль должен содержать не более 128 символов"
                    : wasSubmitted && newPassword === currentPassword
                      ? "Новый пароль должен отличаться от текущего"
                      : "От 8 до 128 символов"
              }
              fullWidth
              slotProps={{
                input: {
                  endAdornment: passwordAdornment(
                    newPasswordVisible,
                    () => setNewPasswordVisible((visible) => !visible),
                    newPasswordVisible
                      ? "Скрыть новый пароль"
                      : "Показать новый пароль",
                  ),
                },
              }}
            />

            <TextField
              label="Повторите новый пароль"
              type={confirmationVisible ? "text" : "password"}
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              autoComplete="new-password"
              error={confirmationError}
              helperText={
                confirmationError ? "Пароли не совпадают" : " "
              }
              fullWidth
              slotProps={{
                input: {
                  endAdornment: passwordAdornment(
                    confirmationVisible,
                    () => setConfirmationVisible((visible) => !visible),
                    confirmationVisible
                      ? "Скрыть подтверждение пароля"
                      : "Показать подтверждение пароля",
                  ),
                },
              }}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: "100%",
            maxWidth: 600,
            mx: "auto",
          }}
        >
          <Box
            sx={{
              mt: 1,
              border: "1px solid",
              borderColor: (theme) =>
                theme.alpha(theme.vars.palette.primary.main, 0.12),
              borderRadius: 3,
              bgcolor: (theme) =>
                theme.alpha(theme.vars.palette.primary.main, 0.055),
              p: 2,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <InfoOutlined sx={{ color: "primary.main", fontSize: 21 }} />
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "0.9rem",
                  fontWeight: 750,
                }}
              >
                Требования к паролю
              </Typography>
            </Stack>

            <Box
              component="ul"
              sx={{
                display: "grid",
                mt: 1,
                mb: 0,
                pl: 2.5,
                gap: 0.6,
                color: "text.primary",
              }}
            >
              <Typography component="li" sx={{ fontSize: "0.8rem" }}>
                Пароль должен содержать не менее 8 символов
              </Typography>
              <Typography component="li" sx={{ fontSize: "0.8rem" }}>
                Рекомендуем использовать буквы разного регистра, цифры и
                специальные символы
              </Typography>
              <Typography component="li" sx={{ fontSize: "0.8rem" }}>
                Не используйте простые и легко угадываемые пароли
              </Typography>
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={2.5}
            sx={{ mt: 2 }}
          >
            <Button
              fullWidth
              disabled={mutation.isPending}
              onClick={handleReset}
              sx={{
                minHeight: 46,
                borderRadius: 3,
                bgcolor: "app.background.field",
                color: "text.primary",
                "&:hover": { bgcolor: "app.background.field" },
              }}
            >
              Отмена
            </Button>

            <Button
              type="submit"
              form="change-password-form"
              variant="contained"
              fullWidth
              disabled={mutation.isPending}
              sx={{ minHeight: 46, borderRadius: 3 }}
            >
              {mutation.isPending ? "Сохранение..." : "Сохранить пароль"}
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          mt: 1.5,
          border: "1px solid",
          borderColor: (theme) =>
            theme.alpha(theme.vars.palette.primary.main, 0.12),
          borderRadius: 3,
          bgcolor: (theme) =>
            theme.alpha(theme.vars.palette.primary.main, 0.055),
          p: { xs: 1.5, md: 2 },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <InfoOutlined sx={{ color: "primary.main", fontSize: 21 }} />
          <Typography
            sx={{ color: "primary.main", fontSize: "0.9rem", fontWeight: 750 }}
          >
            Требования к паролю
          </Typography>
        </Stack>

        <Box
          component="ul"
          sx={{
            display: "grid",
            mt: 1,
            mb: 0,
            pl: 2.5,
            gap: 0.6,
            color: "text.primary",
          }}
        >
          <Typography component="li" sx={{ fontSize: "0.8rem" }}>
            Пароль должен содержать не менее 8 символов
          </Typography>
          <Typography component="li" sx={{ fontSize: "0.8rem" }}>
            Рекомендуем использовать буквы разного регистра, цифры и
            специальные символы
          </Typography>
          <Typography component="li" sx={{ fontSize: "0.8rem" }}>
            Не используйте простые и легко угадываемые пароли
          </Typography>
        </Box>
      </Paper>

      <Button
        type="submit"
        form="change-password-form"
        variant="contained"
        fullWidth
        disabled={mutation.isPending}
        sx={{
          display: { xs: "flex", md: "none" },
          minHeight: 48,
          mt: 1.5,
          borderRadius: 3,
        }}
      >
        {mutation.isPending ? "Сохранение..." : "Сменить пароль"}
      </Button>

      {toast && (
        <Box
          sx={{
            position: "fixed",
            left: "50%",
            bottom: { xs: 84, md: 24 },
            zIndex: 2000,
            width: "calc(100% - 32px)",
            maxWidth: 440,
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setToast(null)}
            sx={{
              width: "100%",
              boxShadow: (theme) => theme.appShadows.toast,
              pointerEvents: "auto",
            }}
          >
            {toast.message}
          </Alert>
        </Box>
      )}
    </Box>
  );
};
