import {
  ArrowBack,
  CalendarMonth,
  CalendarToday,
  ChevronLeft,
  ChevronRight,
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
  ButtonBase,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useState } from "react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { getCurrentUser, logout } from "../api/auth";

import { AUTH_QUERY_KEY } from "../api/authQuery";

import gzLogo from "../assets/gzlogo.svg";

const EXPANDED_SIDEBAR_WIDTH = 240;
const COLLAPSED_SIDEBAR_WIDTH = 72;

const DESKTOP_HEADER_HEIGHT = 72;

const NAVY = "#16213E";
const LIGHT_NAVY = "#E7ECF7";

const TEXT_WHITE = "#F7F9FC";
const TEXT_WHITE_SECONDARY = "rgba(247, 249, 252, 0.72)";
const TEXT_WHITE_MUTED = "rgba(247, 249, 252, 0.5)";

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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCollapseTooltipOpen, setIsCollapseTooltipOpen] = useState(false);

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

      queryClient.setQueryData(AUTH_QUERY_KEY, null);

      navigate("/login", {
        replace: true,
      });
    },
  });

  const isProfilePage = location.pathname === "/profile";

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

  const handleProfileBack = () => {
    navigate(profileFrom);
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

        backgroundColor: {
          xs: "#F7F8FA",
          md: NAVY,
        },
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

          gridTemplateColumns: "48px 1fr 48px",

          alignItems: "center",

          height: 56,

          px: 1,

          backgroundColor: NAVY,
          color: "white",

          boxShadow: "0 1px 5px rgba(0, 0, 0, 0.16)",
        }}
      >
        {isProfilePage ? (
          <IconButton
            onClick={handleProfileBack}
            aria-label="Назад"
            sx={{
              color: "white",
              justifySelf: "center",
            }}
          >
            <ArrowBack />
          </IconButton>
        ) : (
          <IconButton
            aria-label="Меню"
            sx={{
              color: "white",
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

            fontWeight: isProfilePage ? 600 : 700,

            textAlign: "center",

            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {isProfilePage ? "Профиль" : "ASVK Schedule"}
        </Typography>

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

              bgcolor: LIGHT_NAVY,
              color: NAVY,

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

          color: "white",

          bgcolor: NAVY,

          borderRight: "1px solid rgba(255, 255, 255, 0.08)",

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
                bgcolor: "rgba(97, 97, 97, 0.96)",
                color: "#FFFFFF",
                opacity: 1,

                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.22)",
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

              color: TEXT_WHITE,
              bgcolor: NAVY,

              border: "1px solid",
              borderColor: "rgba(247, 249, 252, 0.22)",

              boxShadow: "0 3px 10px rgba(0, 0, 0, 0.22)",

              "&:hover": {
                bgcolor: "#202D4D",

                borderColor: "rgba(247, 249, 252, 0.38)",
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

              color: "#FFFFFF",
              bgcolor: "rgba(76, 150, 255, 0.18)",
            }}
          >
            <SchoolRounded
              sx={{
                fontSize: 28,
                color: "#78ADFF",
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
                  color: TEXT_WHITE,

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

                  color: TEXT_WHITE,

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

                  color: TEXT_WHITE_SECONDARY,

                  transition: "background-color 150ms ease, color 150ms ease",

                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.07)",

                    color: TEXT_WHITE,
                  },

                  "&.active": {
                    bgcolor: "rgba(76, 150, 255, 0.2)",

                    color: "#8BBCFF",

                    "&:hover": {
                      bgcolor: "rgba(76, 150, 255, 0.27)",
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

              bgcolor: "rgba(255, 255, 255, 0.4)",

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
                  color: TEXT_WHITE,

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

                  color: TEXT_WHITE_MUTED,

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

          bgcolor: NAVY,
          color: "white",

          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.12)",

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
              color: LIGHT_NAVY,
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
              color: "white",
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
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,

                bgcolor: LIGHT_NAVY,
                color: NAVY,

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

                  color: TEXT_WHITE_SECONDARY,

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

                color: "rgba(255, 255, 255, 0.8)",
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

              boxShadow: "0 8px 28px rgba(0, 0, 0, 0.18)",

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

              bgcolor: NAVY,
              color: "white",

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

        {/* TODO: добавить страницу и функциональность настроек пользователя */}
        <MenuItem disabled>
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>

          <ListItemText>Настройки</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => logoutMutation.mutate()}
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
            xs: "auto",
            md: `calc(100dvh - ${DESKTOP_HEADER_HEIGHT}px)`,
          },

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

          bgcolor: "#F7F8FA",

          borderTopLeftRadius: {
            xs: 0,
            md: "20px",
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
