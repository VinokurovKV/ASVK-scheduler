import { CalendarMonth, Event, Groups, Home } from "@mui/icons-material";

import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const sidebarWidth = 240;

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f7f8fa",
      }}
    >
      {/* Mobile header */}
      <Box
        component="header"
        sx={{
          display: {
            xs: "flex",
            md: "none",
          },

          alignItems: "center",
          height: 56,
          px: 2,

          borderBottom: "1px solid",
          borderColor: "divider",

          backgroundColor: "background.paper",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
          }}
        >
          ASVK Schedule
        </Typography>
      </Box>

      {/* Desktop sidebar */}
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

      {/* Page */}
      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            md: `${sidebarWidth}px`,
          },

          p: {
            xs: 2,
            md: 4,
          },

          pb: {
            xs: 10,
            md: 4,
          },
        }}
      >
        <Outlet />
      </Box>

      {/* Mobile navigation */}
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
    </Box>
  );
};
