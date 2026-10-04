import {
  ArrowBack,
  CalendarMonth,
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  Close,
  Event,
  Groups,
  Home,
  KeyboardArrowDown,
  Logout,
  Menu as MenuIcon,
  NotificationsNoneOutlined,
  PersonOutlined,
  SchoolRounded,
  SettingsOutlined,
} from "@mui/icons-material";

import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  ButtonBase,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useState } from "react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { getCurrentUser, logout } from "../api/auth";

import { AUTH_QUERY_KEY } from "../api/authQuery";

import gzLogo from "../assets/gzlogo.svg";

const EXPANDED_SIDEBAR_WIDTH = 240;
const COLLAPSED_SIDEBAR_WIDTH = 72;

const DESKTOP_HEADER_HEIGHT = 72;

const navigation = [
  {
    label: "Сегодня",
    path: "/",
    icon: <Home />,
  },
  {
    label: "Расписание",
    path: "/schedule",
    icon: <CalendarMonth />,
  },
  {
    label: "События",
    path: "/events",
    icon: <Event />,
  },
  {
    label: "Встречи",
    path: "/meetings",
    icon: <Groups />,
  },
];

const formatCurrentDate = () => {
  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down("md"));

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCollapseTooltipOpen, setIsCollapseTooltipOpen] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
    useState(false);

  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

  const [menuArrowRight, setMenuArrowRight] = useState(14);

  const { data: user } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      setUserMenuAnchor(null);
      setIsLogoutConfirmationOpen(false);

      queryClient.setQueryData(AUTH_QUERY_KEY, null);

      navigate("/login", {
        replace: true,
      });
    },
  });

  const isProfilePage = location.pathname === "/profile";
  const isSettingsPage = location.pathname === "/settings";
  const isActiveSessionsPage = location.pathname === "/settings/sessions";
  const isChangePasswordPage = location.pathname === "/settings/password";
  const isMobileSubpage =
    isProfilePage ||
    isSettingsPage ||
    isActiveSessionsPage ||
    isChangePasswordPage;

  const currentSidebarWidth = isSidebarCollapsed
    ? COLLAPSED_SIDEBAR_WIDTH
    : EXPANDED_SIDEBAR_WIDTH;

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const userRoleLabel = (() => {
    if (!user?.role) {
      return "Пользователь";
    }

    if (user.role === "STUDENT") {
      return user.groupNumber
        ? `Студент · Группа ${user.groupNumber}`
        : "Студент";
    }

    if (user.role === "POSTGRADUATE") {
      return "Аспирант";
    }

    if (user.role === "EMPLOYEE") {
      return "Сотрудник";
    }

    return "Пользователь";
  })();

  const profileFrom =
    (
      location.state as {
        from?: string;
      } | null
    )?.from ?? "/";

  const settingsFrom =
    (
      location.state as {
        from?: string;
      } | null
    )?.from ?? "/";

  const handleProfileClick = () => {
    setUserMenuAnchor(null);

    if (isProfilePage) {
      return;
    }

    navigate("/profile", {
      state: {
        from: location.pathname,
      },
    });
  };

  const handleSettingsClick = () => {
    setUserMenuAnchor(null);

    if (isSettingsPage) {
      return;
    }

    navigate("/settings", {
      state: {
        from: location.pathname,
      },
    });
  };

  const handleProfileBack = () => {
    navigate(profileFrom);
  };

  const handleSettingsBack = () => {
    navigate(settingsFrom);
  };

  const handleActiveSessionsBack = () => {
    navigate("/settings");
  };

  const handleChangePasswordBack = () => {
    navigate("/settings");
  };

  const handleLogoutClick = () => {
    setUserMenuAnchor(null);
    setIsLogoutConfirmationOpen(true);
  };

  const handleUserMenuOpen = (element: HTMLElement) => {
    const avatar = element.querySelector<HTMLElement>(".MuiAvatar-root");

    if (avatar) {
      const elementRect = element.getBoundingClientRect();

      const avatarRect = avatar.getBoundingClientRect();

      const avatarCenter = avatarRect.left + avatarRect.width / 2;

      const distanceFromRight = elementRect.right - avatarCenter;

      setMenuArrowRight(distanceFromRight - 6);
    }

    setUserMenuAnchor(element);
  };

  const currentDate = formatCurrentDate();

  return (
    <Box
      sx={{
        minHeight: "100dvh",

        background: (theme) =>
          `linear-gradient(to bottom, ${theme.palette.app.brand.navy} 0, ${theme.palette.app.brand.navy} 92px, ${theme.palette.background.default} 92px, ${theme.palette.background.default} 100%)`,
      }}
    >
      {/* Мобильная верхняя панель */}
      <Box
        component="header"
        sx={{
          display: {
            xs: "grid",
            md: "none",
          },

          position: "sticky",
          top: 0,
          zIndex: 1200,

          gridTemplateColumns: "48px minmax(0, 1fr) 40px 48px",

          alignItems: "center",

          height: 64,

          px: 1,

          backgroundColor: "app.brand.navy",
          color: "common.white",

          boxShadow: (theme) => theme.appShadows.appBar,
        }}
      >
        {isMobileSubpage ? (
          <IconButton
            onClick={
              isProfilePage
                ? handleProfileBack
                : isActiveSessionsPage
                  ? handleActiveSessionsBack
                  : isChangePasswordPage
                    ? handleChangePasswordBack
                  : handleSettingsBack
            }
            aria-label="Назад"
            sx={{
              color: "common.white",
              justifySelf: "center",
            }}
          >
            <ArrowBack />
          </IconButton>
        ) : (
          <IconButton
            aria-label="Меню"
            sx={{
              color: "common.white",
              justifySelf: "center",
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          sx={{
            minWidth: 0,

            fontWeight: isMobileSubpage ? 600 : 700,

            textAlign: "center",

            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {isProfilePage
            ? "Профиль"
            : isSettingsPage
              ? "Настройки"
              : isActiveSessionsPage
                ? "Активные сессии"
                : isChangePasswordPage
                  ? "Смена пароля"
              : "ASVK Schedule"}
        </Typography>

        <IconButton
          aria-label="Уведомления"
          sx={{
            justifySelf: "center",
            color: "common.white",
          }}
        >
          <NotificationsNoneOutlined />
        </IconButton>

        <IconButton
          aria-label="Меню пользователя"
          onClick={(event) => handleUserMenuOpen(event.currentTarget)}
          sx={{
            justifySelf: "center",
            p: 0.5,
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,

              bgcolor: "app.brand.navySoft",
              color: "app.brand.navy",

              fontSize: "0.82rem",
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
        </IconButton>
      </Box>

      {/* Боковая панель на десктопе */}
      <Box
        component="aside"
        sx={{
          display: {
            xs: "none",
            md: "flex",
          },

          position: "fixed",

          top: 0,
          bottom: 0,
          left: 0,

          zIndex: 1200,

          width: currentSidebarWidth,

          boxSizing: "border-box",

          flexDirection: "column",

          px: isSidebarCollapsed ? 1 : 2,

          py: 2,

          color: "common.white",

          bgcolor: "app.brand.navy",

          borderRight: "1px solid",
          borderRightColor: "app.border.sidebar",

          transition: "width 220ms ease, padding 220ms ease",
        }}
      >
        {/* Кнопка сворачивания панели */}
        <Tooltip
          title={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
          placement="right"
          open={isCollapseTooltipOpen}
          onOpen={() => setIsCollapseTooltipOpen(true)}
          onClose={() => setIsCollapseTooltipOpen(false)}
          disableInteractive
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -8],
                  },
                },
              ],
            },

            tooltip: {
              sx: {
                bgcolor: "app.overlay.tooltip",
                color: "common.white",
                opacity: 1,

                boxShadow: (theme) => theme.appShadows.floating,
              },
            },
          }}
        >
          <IconButton
            aria-label={
              isSidebarCollapsed
                ? "Развернуть боковую панель"
                : "Свернуть боковую панель"
            }
            onClick={() => {
              setIsCollapseTooltipOpen(false);

              setIsSidebarCollapsed((value) => !value);
            }}
            sx={{
              position: "absolute",

              top: 20,
              right: -15,

              width: 30,
              height: 30,

              zIndex: 2,

              color: "app.text.onDark",
              bgcolor: "app.brand.navy",

              border: "1px solid",
              borderColor: "app.border.onDark",

              boxShadow: (theme) => theme.appShadows.floating,

              "&:hover": {
                bgcolor: "app.brand.navyHover",

                borderColor: "app.border.onDarkHover",
              },
            }}
          >
            {isSidebarCollapsed ? (
              <ChevronRight
                sx={{
                  fontSize: 19,
                }}
              />
            ) : (
              <ChevronLeft
                sx={{
                  fontSize: 19,
                }}
              />
            )}
          </IconButton>
        </Tooltip>

        {/* Логотип */}
        <Box
          sx={{
            display: "flex",

            minHeight: 64,

            alignItems: "center",

            justifyContent: isSidebarCollapsed ? "center" : "flex-start",

            gap: 1.25,

            px: isSidebarCollapsed ? 0 : 0.5,

            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",

              width: 40,
              height: 40,

              flexShrink: 0,

              placeItems: "center",

              borderRadius: 2,

              color: "common.white",
              bgcolor: "app.navigation.active",
            }}
          >
            <SchoolRounded
              sx={{
                fontSize: 28,
                color: "app.navigation.icon",
              }}
            />
          </Box>

          {!isSidebarCollapsed && (
            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  color: "app.text.onDark",

                  fontSize: "1rem",
                  fontWeight: 800,
                  lineHeight: 1.05,

                  whiteSpace: "nowrap",
                }}
              >
                ASVK
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,

                  color: "app.text.onDark",

                  fontSize: "1rem",
                  fontWeight: 800,
                  lineHeight: 1.05,

                  whiteSpace: "nowrap",
                }}
              >
                Schedule
              </Typography>
            </Box>
          )}
        </Box>

        {/* Основная навигация */}
        <List
          sx={{
            mt: 2,
            px: 0,
          }}
        >
          {navigation.map((item) => (
            <Tooltip
              key={item.path}
              title={isSidebarCollapsed ? item.label : ""}
              placement="right"
            >
              <ListItemButton
                component={NavLink}
                to={item.path}
                end={item.path === "/"}
                sx={{
                  minHeight: 48,

                  mb: 0.75,

                  px: isSidebarCollapsed ? 0 : 1.5,

                  justifyContent: isSidebarCollapsed ? "center" : "flex-start",

                  borderRadius: 2.5,

                  color: "app.text.onDarkSecondary",

                  transition: "background-color 150ms ease, color 150ms ease",

                  "&:hover": {
                    bgcolor: "app.navigation.hover",

                    color: "app.text.onDark",
                  },

                  "&.active": {
                    bgcolor: "app.navigation.active",

                    color: "app.navigation.icon",

                    "&:hover": {
                      bgcolor: "app.navigation.active",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isSidebarCollapsed ? 0 : 40,

                    justifyContent: "center",

                    color: "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {!isSidebarCollapsed && (
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: 600,

                          fontSize: "0.95rem",

                          whiteSpace: "nowrap",
                        },
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>

        {/* Нижний декоративный блок */}
        <Box
          sx={{
            mt: "auto",

            display: "flex",
            flexDirection: "column",
            alignItems: "center",

            overflow: "hidden",

            pb: 0.5,
          }}
        >
          <Box
            role="img"
            aria-label="Главное здание МГУ"
            sx={{
              width: isSidebarCollapsed ? 44 : "100%",

              maxWidth: 185,

              height: isSidebarCollapsed ? 46 : 105,

              flexShrink: 0,

              bgcolor: "app.text.onDarkMuted",

              maskImage: `url("${gzLogo}")`,

              WebkitMaskImage: `url("${gzLogo}")`,

              maskRepeat: "no-repeat",

              WebkitMaskRepeat: "no-repeat",

              maskPosition: "center",

              WebkitMaskPosition: "center",

              maskSize: "contain",

              WebkitMaskSize: "contain",

              transition: "width 220ms ease, height 220ms ease",
            }}
          />

          {!isSidebarCollapsed && (
            <Box
              sx={{
                width: "100%",

                mt: 1.25,

                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: "app.text.onDark",

                  fontSize: "0.78rem",

                  fontWeight: 700,

                  lineHeight: 1.3,

                  whiteSpace: "nowrap",
                }}
              >
                Кафедра АСВК
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,

                  color: "app.text.onDarkMuted",

                  fontSize: "0.66rem",

                  lineHeight: 1.3,

                  whiteSpace: "nowrap",
                }}
              >
                ВМК МГУ им. Ломоносова
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Верхняя панель на десктопе */}
      <Box
        component="header"
        sx={{
          display: {
            xs: "none",
            md: "flex",
          },

          position: "fixed",

          top: 0,
          right: 0,
          left: currentSidebarWidth,

          zIndex: 1100,

          height: DESKTOP_HEADER_HEIGHT,

          alignItems: "center",
          justifyContent: "space-between",

          px: 3,

          bgcolor: "app.brand.navy",
          color: "common.white",

          boxShadow: (theme) => theme.appShadows.topBar,

          transition: "left 220ms ease",
        }}
      >
        {/* Текущая дата */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <CalendarToday
            sx={{
              fontSize: 22,
              color: "app.brand.navySoft",
            }}
          />

          <Typography
            sx={{
              fontWeight: 600,
            }}
          >
            {currentDate}
          </Typography>
        </Box>

        {/* Пользователь и уведомления */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* TODO: добавить уведомления */}
          <IconButton
            aria-label="Уведомления"
            sx={{
              color: "common.white",
            }}
          >
            <NotificationsNoneOutlined />
          </IconButton>

          <ButtonBase
            aria-label="Меню пользователя"
            onClick={(event) => handleUserMenuOpen(event.currentTarget)}
            sx={{
              display: "flex",
              alignItems: "center",

              gap: 1.25,

              px: 1,
              py: 0.75,

              borderRadius: 2,

              color: "inherit",
              textAlign: "left",

              transition: "background-color 0.15s ease",

              "&:hover": {
                bgcolor: "app.navigation.hover",
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,

                bgcolor: "app.brand.navySoft",
                color: "app.brand.navy",

                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>

            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  maxWidth: 190,

                  fontWeight: 700,

                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name ?? "Пользователь"}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display: "block",

                  maxWidth: 190,

                  mt: 0.1,

                  color: "app.text.onDarkSecondary",

                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userRoleLabel}
              </Typography>
            </Box>

            <KeyboardArrowDown
              sx={{
                ml: 0.25,

                fontSize: 20,

                color: "app.text.onDarkSecondary",
              }}
            />
          </ButtonBase>
        </Box>
      </Box>

      {/* Меню пользователя */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.25,

              minWidth: 270,

              overflow: "visible",

              borderRadius: 2,

              boxShadow: (theme) => theme.appShadows.menu,

              "&::before": {
                content: '""',

                position: "absolute",

                top: -6,

                right: {
                  xs: `${menuArrowRight - 5}px`,
                  md: `${menuArrowRight}px`,
                },

                width: 12,
                height: 12,

                bgcolor: "background.paper",

                transform: "rotate(45deg)",

                borderTop: "1px solid",

                borderLeft: "1px solid",

                borderColor: "divider",

                zIndex: 0,
              },
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",

            gap: 1.5,

            px: 2,
            py: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,

              flexShrink: 0,

              bgcolor: "app.brand.navy",
              color: "common.white",

              fontSize: "0.95rem",

              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,

                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name ?? "Пользователь"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.2,

                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userRoleLabel}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={handleProfileClick} selected={isProfilePage}>
          <ListItemIcon>
            <PersonOutlined fontSize="small" />
          </ListItemIcon>

          <ListItemText>Профиль</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSettingsClick} selected={isSettingsPage}>
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>

          <ListItemText>Настройки</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogoutClick}
          disabled={logoutMutation.isPending}
          sx={{
            color: "error.main",
          }}
        >
          <ListItemIcon
            sx={{
              color: "inherit",
            }}
          >
            <Logout fontSize="small" />
          </ListItemIcon>

          <ListItemText>Выйти</ListItemText>
        </MenuItem>
      </Menu>

      <Drawer
        anchor="bottom"
        open={isMobileViewport && isLogoutConfirmationOpen}
        onClose={() => {
          if (!logoutMutation.isPending) {
            setIsLogoutConfirmationOpen(false);
          }
        }}
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

          <Typography
            id="logout-confirmation-title"
            sx={{
              mt: 1.25,
              fontSize: "1.05rem",
              fontWeight: 750,
            }}
          >
            Выйти из аккаунта?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              px: 2,
              textAlign: "center",
            }}
          >
            Вы уверены, что хотите выйти из текущей сессии?
          </Typography>

          <Stack spacing={1} sx={{ width: "100%", mt: "auto" }}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={<Logout />}
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              sx={{ minHeight: 44, borderRadius: 3.5 }}
            >
              Выйти
            </Button>

            <Button
              fullWidth
              disabled={logoutMutation.isPending}
              onClick={() => setIsLogoutConfirmationOpen(false)}
              sx={{
                minHeight: 44,
                borderRadius: 3.5,
                bgcolor: "app.background.field",
                color: "text.primary",
                "&:hover": {
                  bgcolor: "app.background.field",
                },
              }}
            >
              Отмена
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      <Dialog
        open={!isMobileViewport && isLogoutConfirmationOpen}
        onClose={() => {
          if (!logoutMutation.isPending) {
            setIsLogoutConfirmationOpen(false);
          }
        }}
        fullWidth
        maxWidth="xs"
        aria-labelledby="desktop-logout-confirmation-title"
        slotProps={{
          paper: {
            sx: {
              position: "relative",
              maxWidth: 460,
              borderRadius: 4,
              p: 3,
            },
          },
        }}
      >
        <IconButton
          aria-label="Закрыть подтверждение выхода"
          disabled={logoutMutation.isPending}
          onClick={() => setIsLogoutConfirmationOpen(false)}
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
            <Logout sx={{ fontSize: 44 }} />
          </Box>

          <Typography
            id="desktop-logout-confirmation-title"
            sx={{
              mt: 1.5,
              fontSize: "1.15rem",
              fontWeight: 750,
            }}
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
              color: (theme) => alpha(theme.palette.text.primary, 0.35),
              fontFamily: (theme) => theme.typography.body1.fontFamily,
              fontSize: "0.75rem",
              textAlign: "center",
            }}
          >
            Вы снова сможете войти в любой момент
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ width: "100%", mt: 3 }}>
            <Button
              fullWidth
              disabled={logoutMutation.isPending}
              onClick={() => setIsLogoutConfirmationOpen(false)}
              sx={{
                minHeight: 44,
                borderRadius: 3.5,
                bgcolor: "app.background.field",
                color: "text.primary",
                "&:hover": {
                  bgcolor: "app.background.field",
                },
              }}
            >
              Отмена
            </Button>

            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={<Logout />}
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              sx={{ minHeight: 44, borderRadius: 3.5 }}
            >
              Выйти
            </Button>
          </Stack>
        </Stack>
      </Dialog>

      {/* Содержимое страницы */}
      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            md: `${currentSidebarWidth}px`,
          },

          mt: {
            xs: 0,
            md: `${DESKTOP_HEADER_HEIGHT}px`,
          },

          minHeight: {
            xs: "calc(100dvh - 64px)",
            md: `calc(100dvh - ${DESKTOP_HEADER_HEIGHT}px)`,
          },

          overflow: "hidden",

          px: {
            xs: isProfilePage ? 0 : 2,
            md: 4,
          },

          pt: {
            xs: isProfilePage ? 0 : 2,
            md: 4,
          },

          pb: {
            xs: isProfilePage ? 0 : 10,
            md: 4,
          },

          bgcolor: "background.default",

          borderTopLeftRadius: {
            xs: "20px",
            md: "20px",
          },

          borderTopRightRadius: {
            xs: "20px",
            md: 0,
          },

          transition: "margin-left 220ms ease",
        }}
      >
        <Outlet />
      </Box>

      {/* Нижняя навигация на мобильных устройствах */}
      {!isProfilePage && (
        <Paper
          elevation={8}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },

            position: "fixed",

            right: 0,
            bottom: 0,
            left: 0,

            zIndex: 1000,
          }}
        >
          <BottomNavigation
            value={location.pathname}
            onChange={(_, value: string) => {
              navigate(value);
            }}
            showLabels
            sx={{
              height: 68,
            }}
          >
            {navigation.map((item) => (
              <BottomNavigationAction
                key={item.path}
                value={item.path}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};
