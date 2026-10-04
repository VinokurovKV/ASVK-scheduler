import {
  ChevronRightRounded,
  ChatOutlined,
  DarkModeOutlined,
  DevicesOutlined,
  DesktopWindowsOutlined,
  GroupsOutlined,
  LightModeOutlined,
  LockOutlined,
  NotificationsNoneRounded,
  PersonOutlineRounded,
  PowerSettingsNewOutlined,
  SchoolRounded,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "../api/auth";
import { AUTH_QUERY_KEY } from "../api/authQuery";
import { LogoutAllSessionsConfirmation } from "../components/auth/LogoutAllSessionsConfirmation";

const appearanceOptions = [
  {
    value: "light",
    mobileLabel: "Светлая",
    label: "Светлая тема",
    description: "Чистый и светлый интерфейс",
    icon: <LightModeOutlined />,
  },
  {
    value: "dark",
    mobileLabel: "Тёмная",
    label: "Тёмная тема",
    description: "Тёмный интерфейс для комфортной работы",
    icon: <DarkModeOutlined />,
  },
  {
    value: "system",
    mobileLabel: "Системная",
    label: "Системная тема",
    description: "Автоматическое переключение",
    icon: <DesktopWindowsOutlined />,
  },
] as const;

const getRoleLabel = (
  role: "STUDENT" | "POSTGRADUATE" | "EMPLOYEE" | null,
  groupNumber: string | null,
) => {
  if (role === "STUDENT") {
    return groupNumber ? `Студент · Группа ${groupNumber}` : "Студент";
  }

  if (role === "POSTGRADUATE") {
    return "Аспирант";
  }

  if (role === "EMPLOYEE") {
    return "Сотрудник";
  }

  return "Пользователь";
};

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [eventRemindersEnabled, setEventRemindersEnabled] = useState(true);
  const [meetingNotificationsEnabled, setMeetingNotificationsEnabled] =
    useState(true);
  const [isLogoutAllConfirmationOpen, setIsLogoutAllConfirmationOpen] =
    useState(false);

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

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;
  const roleLabel = getRoleLabel(user.role, user.groupNumber);

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        component="h1"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
          fontSize: {
            xs: "1.65rem",
            md: "2.125rem",
          },
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        Настройки
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
          mt: 0.5,
        }}
      >
        Настройте внешний вид приложения, уведомления и параметры безопасности.
      </Typography>

      <Box
        sx={{
          display: {
            xs: "block",
            lg: "grid",
          },
          mt: {
            xs: 0,
            md: 2.5,
          },
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          alignItems: "stretch",
          gap: 2,
        }}
      >
        <Paper
          component="section"
          variant="outlined"
          sx={{
            width: "100%",
            mt: {
              xs: 1.25,
              md: 0,
            },
            borderRadius: 3,
            boxShadow: (theme) => theme.appShadows.button,
            p: {
              xs: 1.5,
              md: 1.5,
            },
            pb: {
              md: 0.75,
            },
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: "1rem",
              fontWeight: 750,
            }}
          >
            Аккаунт
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
              mt: 0.25,
            }}
          >
            Управление личной информацией и профилем.
          </Typography>

          <Box
            sx={{
              display: {
                xs: "block",
                md: "grid",
              },
              mt: {
                xs: 0,
                md: 0.75,
              },
              gridTemplateColumns: {
                md: "64px minmax(0, 1fr)",
              },
              columnGap: 1.5,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                display: {
                  xs: "flex",
                  md: "contents",
                },
                mt: {
                  xs: 1.25,
                  md: 0,
                },
                minWidth: 0,
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  width: {
                    xs: 64,
                    md: 64,
                  },
                  height: {
                    xs: 64,
                    md: 64,
                  },
                  flexShrink: 0,
                  bgcolor: "app.brand.navy",
                  color: "common.white",
                  fontSize: {
                    xs: "1.2rem",
                    md: "1.45rem",
                  },
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    overflow: "hidden",
                    fontWeight: 700,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fullName}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mt: 0.25,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {roleLabel}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mt: 0.1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<PersonOutlineRounded />}
              endIcon={<ChevronRightRounded />}
              onClick={() =>
                navigate("/profile", {
                  state: {
                    from: "/settings",
                  },
                })
              }
              sx={{
                width: {
                  xs: "100%",
                  md: "auto",
                },
                minWidth: {
                  md: 190,
                },
                mt: {
                  xs: 1.5,
                  md: 0.5,
                },
                gridColumn: {
                  md: 2,
                },
                justifySelf: {
                  md: "end",
                },
                minHeight: {
                  xs: 42,
                  md: 36,
                },
                justifyContent: "flex-start",
                borderColor: "divider",
                borderRadius: 2.5,
                color: "text.primary",
                textTransform: "none",
                "& .MuiButton-endIcon": {
                  ml: "auto",
                },
              }}
            >
              Изменить профиль
            </Button>
          </Box>
        </Paper>

        <Paper
          component="section"
          variant="outlined"
          sx={{
            display: "block",
            mt: {
              xs: 1.5,
              md: 1.5,
              lg: 0,
            },
            borderRadius: 3,
            boxShadow: (theme) => theme.appShadows.button,
            p: {
              xs: 1.5,
              md: 1.5,
            },
            pb: {
              md: 0.75,
            },
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: "1rem",
              fontWeight: 750,
            }}
          >
            Внешний вид
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
              mt: 0.25,
            }}
          >
            Выберите, как будет выглядеть приложение.
          </Typography>

          <Box
            sx={{
              display: "grid",
              mt: {
                xs: 1.25,
                md: 0.75,
              },
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 1,
            }}
          >
            {appearanceOptions.map((option) => {
              const isSelected = option.value === "light";

              return (
                <ButtonBase
                  key={option.value}
                  disabled={!isSelected}
                  aria-label={option.label}
                  aria-pressed={isSelected}
                  sx={{
                    position: "relative",
                    display: "flex",
                    minWidth: 0,
                    minHeight: {
                      xs: 72,
                      md: 88,
                    },
                    border: "1px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    borderRadius: 2.5,
                    bgcolor: isSelected
                      ? "app.brand.navySoft"
                      : "background.paper",
                    flexDirection: "column",
                    alignItems: {
                      xs: "center",
                      md: "flex-start",
                    },
                    justifyContent: {
                      xs: "center",
                      md: "flex-start",
                    },
                    gap: {
                      xs: 0.4,
                      md: 0,
                    },
                    px: {
                      xs: 0.5,
                      md: 1.5,
                    },
                    py: {
                      xs: 0.75,
                      md: 1.25,
                    },
                    opacity: 1,
                    color: isSelected ? "primary.main" : "text.primary",
                    "&.Mui-disabled": {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      height: {
                        md: 28,
                      },
                      placeItems: "center",
                      mb: {
                        md: 0.5,
                      },
                      "& svg": {
                        fontSize: {
                          xs: 23,
                          md: 27,
                        },
                      },
                    }}
                  >
                    {option.icon}
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.primary",
                      fontWeight: 650,
                      lineHeight: 1.15,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: {
                          xs: "inline",
                          md: "none",
                        },
                      }}
                    >
                      {option.mobileLabel}
                    </Box>

                    <Box
                      component="span"
                      sx={{
                        display: {
                          xs: "none",
                          md: "inline",
                        },
                      }}
                    >
                      {option.label}
                    </Box>
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: {
                        xs: "none",
                        md: "block",
                      },
                      width: "100%",
                      minHeight: 34,
                      mt: 0.35,
                      color: "text.secondary",
                      fontSize: "0.68rem",
                      lineHeight: 1.25,
                      textAlign: "left",
                    }}
                  >
                    {option.description}
                  </Typography>

                  <Box
                    aria-hidden="true"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 11,
                      height: 11,
                      border: "1.5px solid",
                      borderColor: isSelected ? "primary.main" : "divider",
                      borderRadius: "50%",
                      bgcolor: isSelected ? "primary.main" : "transparent",
                      boxShadow: isSelected ? "inset 0 0 0 2px white" : "none",
                    }}
                  />
                </ButtonBase>
              );
            })}
          </Box>
        </Paper>
      </Box>

      <Box
        sx={{
          display: {
            xs: "block",
            lg: "grid",
          },
          mt: {
            xs: 0,
            lg: 2,
          },
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          alignItems: "stretch",
          gap: 2,
        }}
      >
        <Paper
          component="section"
          variant="outlined"
          sx={{
            display: "block",
            mt: {
              xs: 1.5,
              lg: 0,
            },
            borderRadius: 3,
            boxShadow: (theme) => theme.appShadows.button,
            p: {
              xs: 1.5,
              md: 2.5,
            },
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: "1rem",
              fontWeight: 750,
            }}
          >
            Уведомления
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
              mt: 0.25,
            }}
          >
            Настройте, какие уведомления вы хотите получать.
          </Typography>

          <Stack
            sx={{
              mt: {
                xs: 0.75,
                md: 1.5,
              },
            }}
          >
            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                minHeight: {
                  xs: 52,
                  md: 64,
                },
                alignItems: "center",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <NotificationsNoneRounded
                sx={{ flexShrink: 0, color: "app.brand.navy" }}
              />

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
                  Напоминания о событиях
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: {
                      xs: "none",
                      md: "block",
                    },
                    mt: 0.15,
                  }}
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
                  input: {
                    "aria-label": "Напоминания о событиях",
                  },
                }}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                minHeight: {
                  xs: 52,
                  md: 64,
                },
                alignItems: "center",
              }}
            >
              <GroupsOutlined sx={{ flexShrink: 0, color: "app.brand.navy" }} />

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
                  Уведомления о встречах
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: {
                      xs: "none",
                      md: "block",
                    },
                    mt: 0.15,
                  }}
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
                  input: {
                    "aria-label": "Уведомления о встречах",
                  },
                }}
              />
            </Stack>
          </Stack>
        </Paper>

        <Paper
          component="section"
          variant="outlined"
          sx={{
            display: "block",
            mt: {
              xs: 1.5,
              lg: 0,
            },
            borderRadius: 3,
            boxShadow: (theme) => theme.appShadows.button,
            p: {
              xs: 1.5,
              md: 2.5,
            },
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: "1rem",
              fontWeight: 750,
            }}
          >
            Безопасность
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
              mt: 0.25,
            }}
          >
            Защитите свой аккаунт и управляйте активными сессиями.
          </Typography>

          <Stack
            sx={{
              mt: {
                xs: 0.75,
                md: 1.5,
              },
            }}
          >
            <ButtonBase
              onClick={() =>
                navigate("/settings/password", {
                  state: { from: "/settings" },
                })
              }
              sx={{
                display: "flex",
                minHeight: {
                  xs: 52,
                  md: 64,
                },
                width: "100%",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: (theme) =>
                  alpha(theme.palette.app.brand.navy, 0.06),
                borderRadius: 2,
                gap: 1.25,
                px: {
                  xs: 1,
                  md: 1.5,
                },
                textAlign: "left",
              }}
            >
              <LockOutlined sx={{ flexShrink: 0, color: "app.brand.navy" }} />

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
                  Изменить пароль
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: {
                      xs: "none",
                      md: "block",
                    },
                    mt: 0.15,
                  }}
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
                minHeight: {
                  xs: 52,
                  md: 64,
                },
                width: "100%",
                mt: {
                  xs: 0.75,
                  md: 0.75,
                },
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: (theme) =>
                  alpha(theme.palette.app.brand.navy, 0.06),
                borderRadius: 2,
                gap: 1.25,
                px: {
                  xs: 1,
                  md: 1.5,
                },
                textAlign: "left",
              }}
            >
              <DevicesOutlined
                sx={{ flexShrink: 0, color: "app.brand.navy" }}
              />

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
                  Активные сессии
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: {
                      xs: "none",
                      md: "block",
                    },
                    mt: 0.15,
                  }}
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
                minHeight: {
                  xs: 52,
                  md: 64,
                },
                width: "100%",
                mt: 0.75,
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: (theme) => alpha(theme.palette.error.main, 0.08),
                borderRadius: 2,
                bgcolor: "app.status.error.surface",
                color: "error.main",
                gap: 1.25,
                px: {
                  xs: 1,
                  md: 1.5,
                },
                opacity: 1,
                textAlign: "left",
                "&.Mui-disabled": {
                  opacity: 1,
                  color: "error.main",
                },
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
                    display: {
                      xs: "none",
                      md: "block",
                    },
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
      </Box>

      <Paper
        component="section"
        variant="outlined"
        sx={{
          display: "block",
          mt: {
            xs: 1.5,
            lg: 2,
          },
          borderRadius: 3,
          boxShadow: (theme) => theme.appShadows.button,
          p: {
            xs: 1.5,
            md: 2.5,
          },
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: "1rem",
            fontWeight: 750,
          }}
        >
          О приложении
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: {
              xs: "none",
              md: "block",
            },
            mt: 0.25,
          }}
        >
          Информация о версии, поддержка и полезные ссылки.
        </Typography>

        <Box
          sx={{
            display: {
              xs: "block",
              md: "grid",
            },
            mt: {
              xs: 0,
              md: 1.5,
            },
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              mt: {
                xs: 1.25,
                md: 0,
              },
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "grid",
                width: 54,
                height: 54,
                flexShrink: 0,
                placeItems: "center",
                borderRadius: 2.25,
                bgcolor: "primary.main",
                color: "common.white",
              }}
            >
              <SchoolRounded sx={{ fontSize: 34 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 750 }}>ASVK Schedule</Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.2 }}
              >
                Версия 0.1.0
              </Typography>
            </Box>
          </Stack>

          <ButtonBase
            onClick={() => navigate("/support", { state: { from: "/settings" } })}
            sx={{
              display: "flex",
              minHeight: {
                xs: 52,
                md: 64,
              },
              width: {
                xs: "100%",
                md: "calc(100% - 20px)",
              },
              mt: {
                xs: 1.25,
                md: 0,
              },
              ml: {
                md: 2.5,
              },
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: (theme) => alpha(theme.palette.app.brand.navy, 0.06),
              borderRadius: 2,
              gap: 1.25,
              px: {
                xs: 1,
                md: 1.5,
              },
              textAlign: "left",
            }}
          >
            <ChatOutlined sx={{ flexShrink: 0, color: "app.brand.navy" }} />

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
                Поддержка
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: {
                    xs: "none",
                    md: "block",
                  },
                  mt: 0.1,
                }}
              >
                Связаться с командой
              </Typography>
            </Box>

            <ChevronRightRounded color="action" />
          </ButtonBase>
        </Box>
      </Paper>

      <LogoutAllSessionsConfirmation
        open={isLogoutAllConfirmationOpen}
        onClose={() => setIsLogoutAllConfirmationOpen(false)}
      />
    </Box>
  );
};
