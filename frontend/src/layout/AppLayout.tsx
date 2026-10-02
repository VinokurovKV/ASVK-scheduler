import {
  ArrowBack,
  CalendarMonth,
  Event,
  Groups,
  Home,
  Logout,
  Menu as MenuIcon,
  PersonOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useState } from "react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { getCurrentUser, logout } from "../api/auth";

import { AUTH_QUERY_KEY } from "../api/authQuery";

const sidebarWidth = 240;

const NAVY = "#16213E";
const LIGHT_NAVY = "#E7ECF7";

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

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

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

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const userRoleLabel = (() => {
    if (!user?.role) {
      return "Пользователь";
    }

    if (user.role === "BACHELOR_STUDENT" || user.role === "MASTER_STUDENT") {
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

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        backgroundColor: "#f7f8fa",
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
          onClick={(event) => setUserMenuAnchor(event.currentTarget)}
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

      {/* Меню пользователя на мобильных устройствах */}
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
                right: 14,

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

      {/* Боковая панель на десктопе */}
      <Box
        component="aside"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,

          width: sidebarWidth,

          p: 2,

          borderRight: "1px solid",
          borderColor: "divider",

          backgroundColor: "background.paper",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          ASVK Schedule
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
          }}
        >
          ВМК МГУ
        </Typography>

        <List>
          {navigation.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.path === "/"}
              sx={{
                mb: 0.5,
                borderRadius: 2,

                "&.active": {
                  backgroundColor: "action.selected",

                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Содержимое страницы */}
      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            md: `${sidebarWidth}px`,
          },

          p: {
            xs: isProfilePage ? 0 : 2,

            md: 4,
          },

          pb: {
            xs: isProfilePage ? 0 : 10,

            md: 4,
          },
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
