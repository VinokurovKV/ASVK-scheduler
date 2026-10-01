import { CalendarMonth, Event, Groups, Home } from "@mui/icons-material";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import { NavLink, Outlet } from "react-router-dom";

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
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f7f8fa",
      }}
    >
      <Box
        component="aside"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          borderRight: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          p: 2,
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
                  backgroundColor: "primary.50",
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

      <Box
        component="main"
        sx={{
          flex: 1,
          p: 4,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
