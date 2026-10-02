import {
  CalendarMonthRounded,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import { type FormEvent, useState } from "react";

import { Link as RouterLink, useNavigate } from "react-router-dom";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "../api/auth";

import asvkLogo from "../assets/logo-asvk-color.svg";
import { AUTH_QUERY_KEY } from "../api/authQuery";

type LoginMode = "ASVK" | "STANDARD";

export const LoginPage = () => {
  const [loginMode, setLoginMode] = useState<LoginMode>("ASVK");
  const [asvkUsername, setAsvkUsername] = useState("");
  const [standardLogin, setStandardLogin] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);

      navigate("/", {
        replace: true,
      });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loginMode === "ASVK") {
      return;
    }

    loginMutation.mutate({
      login: standardLogin.trim(),
      password,
      rememberMe,
    });
  };

  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        minHeight: "100dvh",
        alignItems: {
          xs: "stretch",
          sm: "center",
        },
        justifyContent: "center",
        bgcolor: "#f7f8fa",
        backgroundImage: {
          xs: "none",
          md: "radial-gradient(circle at 18% 82%, rgba(201, 109, 34, 0.10), transparent 32%), radial-gradient(circle at 82% 18%, rgba(52, 120, 185, 0.10), transparent 34%)",
        },
        px: {
          xs: 2,
          sm: 3,
          md: 5,
        },
        py: {
          xs: 3,
          sm: 5,
          md: 6,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: {
            xs: 480,
            md: 920,
          },
          alignSelf: {
            xs: "stretch",
            sm: "center",
          },
          bgcolor: "background.paper",
          border: {
            xs: 0,
            sm: "1px solid",
          },
          borderColor: "divider",
          borderRadius: {
            xs: 0,
            sm: 4,
            md: 5,
          },
          boxShadow: {
            xs: "none",
            sm: "0 18px 50px rgba(31, 41, 55, 0.08)",
          },
          p: {
            xs: 0,
            sm: 4,
            md: 6,
          },
        }}
      >
        <Stack
          spacing={{ xs: 3.5, md: 4.5 }}
          sx={{
            maxWidth: {
              md: 760,
            },
            mx: "auto",
          }}
        >
          <Stack
            spacing={1.5}
            sx={{ alignItems: "center", textAlign: "center" }}
          >
            <Box
              sx={{
                display: "grid",
                width: {
                  xs: 56,
                  md: 68,
                },
                height: {
                  xs: 56,
                  md: 68,
                },
                placeItems: "center",
                borderRadius: 3,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 10px 28px rgba(25, 118, 210, 0.24)",
              }}
            >
              <CalendarMonthRounded fontSize="large" />
            </Box>

            <Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontSize: {
                    xs: "1.75rem",
                    sm: "2rem",
                    md: "2.25rem",
                  },
                  fontWeight: 700,
                }}
              >
                Вход в ASVK Schedule
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Войдите, чтобы открыть своё расписание
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Tabs
              value={loginMode}
              onChange={(_, value: LoginMode) => setLoginMode(value)}
              variant="fullWidth"
              aria-label="Способ входа"
              sx={{
                minHeight: 48,
                borderBottom: "1px solid",
                borderColor: "divider",
                "& .MuiTab-root": {
                  minHeight: 48,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                },
              }}
            >
              <Tab
                value="ASVK"
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src={asvkLogo}
                      alt=""
                      sx={{
                        width: 24,
                        height: 24,
                        objectFit: "contain",
                      }}
                    />

                    <Box component="span">АСВК</Box>
                  </Box>
                }
              />

              <Tab value="STANDARD" label="Стандарт" />
            </Tabs>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ mt: { xs: 3, md: 4 } }}
            >
              <Stack spacing={{ xs: 2.5, md: 3 }}>
                {loginMode === "ASVK" ? (
                  <TextField
                    label="Имя пользователя"
                    value={asvkUsername}
                    onChange={(event) => setAsvkUsername(event.target.value)}
                    autoComplete="username"
                    autoFocus
                    required
                    fullWidth
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment
                            position="end"
                            disablePointerEvents
                            sx={{
                              alignSelf: "stretch",
                              height: "auto",
                              maxHeight: "none",
                              ml: 1,
                              pl: {
                                xs: 1.25,
                                sm: 2,
                              },
                              pr: {
                                xs: 0.5,
                                sm: 1,
                              },
                              borderLeft: "1px solid",
                              borderColor: "divider",
                              color: "text.primary",
                              whiteSpace: "nowrap",
                            }}
                          >
                            @asvk.cs.msu.ru
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                ) : (
                  <TextField
                    label="Логин или основная почта"
                    value={standardLogin}
                    onChange={(event) => setStandardLogin(event.target.value)}
                    autoComplete="username"
                    autoFocus
                    required
                    fullWidth
                  />
                )}

                <TextField
                  label="Пароль"
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  fullWidth
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

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(event.target.checked)
                        }
                      />
                    }
                    label="Запомнить меня"
                  />
                </Box>

                {loginMode === "STANDARD" && loginMutation.isError && (
                  <Alert severity="error">{loginMutation.error.message}</Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loginMode === "ASVK" || loginMutation.isPending}
                  sx={{
                    minHeight: {
                      xs: 48,
                      md: 52,
                    },
                    fontSize: "1rem",
                  }}
                >
                  {loginMode === "ASVK"
                    ? "Вход через домен АСВК пока недоступен"
                    : loginMutation.isPending
                      ? "Вход..."
                      : "Войти"}
                </Button>
              </Stack>
            </Box>
          </Box>

          {loginMode === "STANDARD" && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: "center",
              }}
            >
              Нет аккаунта?{" "}
              <Typography
                component={RouterLink}
                to="/register"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Зарегистрироваться
              </Typography>
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};
