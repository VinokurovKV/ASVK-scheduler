import {
  CalendarMonthRounded,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { Link as RouterLink, useNavigate } from "react-router-dom";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AuthApiError, register } from "../api/auth";
import { AUTH_QUERY_KEY } from "../api/authQuery";

type UserRole =
  | "STUDENT"
  | "POSTGRADUATE"
  | "EMPLOYEE";

const groups = ["321", "421", "521", "621"];

const getRegisterErrorMessage = (error: Error) => {
  if (error instanceof AuthApiError) {
    if (error.status === 409) {
      return "Пользователь с таким логином или почтой уже существует";
    }

    if (error.status === 429) {
      return "Слишком много попыток. Попробуйте снова через минуту";
    }

    if (error.status === 400) {
      return "Проверьте правильность заполнения формы";
    }
  }

  return "Не удалось зарегистрироваться. Попробуйте ещё раз";
};

export const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const [role, setRole] = useState<UserRole>("STUDENT");

  const [group, setGroup] = useState("");

  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const errorToastTimerRef = useRef<number | null>(null);

  const isStudent = role === "STUDENT";

  const isPasswordValid = password.length >= 8;

  const passwordsMatch = password === passwordRepeat;

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    username.trim().length > 0 &&
    (!isStudent || group.length > 0) &&
    isPasswordValid &&
    passwordsMatch;

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const hideErrorToast = () => {
    if (errorToastTimerRef.current !== null) {
      window.clearTimeout(errorToastTimerRef.current);
      errorToastTimerRef.current = null;
    }

    setErrorToast(null);
  };

  const showErrorToast = (message: string) => {
    if (errorToastTimerRef.current !== null) {
      window.clearTimeout(errorToastTimerRef.current);
    }

    setErrorToast(message);

    errorToastTimerRef.current = window.setTimeout(() => {
      setErrorToast(null);
      errorToastTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (errorToastTimerRef.current !== null) {
        window.clearTimeout(errorToastTimerRef.current);
      }
    };
  }, []);

  const registerMutation = useMutation({
    mutationFn: register,

    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);

      navigate("/", {
        replace: true,
      });
    },

    onError: (error) => {
      showErrorToast(getRegisterErrorMessage(error));
    },
  });

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);

    if (newRole !== "STUDENT") {
      setGroup("");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    registerMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),

      email: email.trim(),
      username: username.trim(),

      role,

      groupNumber: isStudent ? group : undefined,

      password,
    });
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",

        px: {
          xs: 2,
          sm: 3,
        },

        py: {
          xs: 3,
          sm: 5,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 720,
          mx: "auto",

          bgcolor: {
            xs: "background.default",
            sm: "background.paper",
          },

          border: {
            xs: 0,
            sm: "1px solid",
          },

          borderColor: "divider",

          borderRadius: {
            xs: 0,
            sm: 4,
          },

          boxShadow: (theme) => ({
            xs: "none",
            sm: theme.appShadows.card,
          }),

          p: {
            xs: 0,
            sm: 4,
          },
        }}
      >
        <Stack spacing={3}>
          <Stack
            spacing={1.25}
            sx={{
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "grid",
                width: 56,
                height: 56,
                placeItems: "center",

                borderRadius: 3,

                bgcolor: "primary.main",
                color: "primary.contrastText",

                boxShadow: (theme) => theme.appShadows.primary,
              }}
            >
              <CalendarMonthRounded fontSize="large" />
            </Box>

            <Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                }}
              >
                Создание аккаунта
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.75,
                }}
              >
                Заполните данные профиля
              </Typography>
            </Box>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.25}>
              <TextField
                label="Имя"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                required
                fullWidth
              />

              <TextField
                label="Фамилия"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                required
                fullWidth
              />

              <TextField
                label="Почта"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                fullWidth
              />

              <TextField
                label="Логин"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value.toLowerCase())
                }
                autoComplete="username"
                required
                fullWidth
                helperText="3–32 символа: латиница, цифры, ., _ или -"
              />

              <FormControl fullWidth>
                <InputLabel id="role-label">Роль</InputLabel>

                <Select
                  labelId="role-label"
                  value={role}
                  label="Роль"
                  onChange={(event) =>
                    handleRoleChange(event.target.value as UserRole)
                  }
                >
                  <MenuItem value="STUDENT">Студент</MenuItem>

                  <MenuItem value="POSTGRADUATE">Аспирант</MenuItem>

                  <MenuItem value="EMPLOYEE">Сотрудник</MenuItem>
                </Select>
              </FormControl>

              {isStudent && (
                <FormControl required fullWidth>
                  <InputLabel id="group-label">Группа</InputLabel>

                  <Select
                    labelId="group-label"
                    value={group}
                    label="Группа"
                    onChange={(event) => setGroup(event.target.value)}
                  >
                    {groups.map((groupNumber) => (
                      <MenuItem key={groupNumber} value={groupNumber}>
                        {groupNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                label="Пароль"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                fullWidth
                error={password.length > 0 && !isPasswordValid}
                helperText={
                  password.length > 0 && !isPasswordValid
                    ? "Минимум 8 символов"
                    : undefined
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() =>
                            setPasswordVisible((visible) => !visible)
                          }
                          aria-label={
                            passwordVisible
                              ? "Скрыть пароль"
                              : "Показать пароль"
                          }
                        >
                          {passwordVisible ? (
                            <VisibilityOffOutlined />
                          ) : (
                            <VisibilityOutlined />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="Повторите пароль"
                type={passwordVisible ? "text" : "password"}
                value={passwordRepeat}
                onChange={(event) => setPasswordRepeat(event.target.value)}
                autoComplete="new-password"
                required
                fullWidth
                error={passwordRepeat.length > 0 && !passwordsMatch}
                helperText={
                  passwordRepeat.length > 0 && !passwordsMatch
                    ? "Пароли не совпадают"
                    : undefined
                }
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={!isFormValid || registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? "Регистрация..."
                  : "Зарегистрироваться"}
              </Button>
            </Stack>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: "center",
            }}
          >
            Уже есть аккаунт?{" "}
            <Typography
              component={RouterLink}
              to="/login"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Войти
            </Typography>
          </Typography>
        </Stack>
      </Paper>

      {errorToast && (
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
          <Alert
            severity="error"
            variant="filled"
            onClose={hideErrorToast}
            sx={{
              width: "100%",
              boxShadow: (theme) => theme.appShadows.toast,
              pointerEvents: "auto",
            }}
          >
            {errorToast}
          </Alert>
        </Box>
      )}
    </Box>
  );
};
