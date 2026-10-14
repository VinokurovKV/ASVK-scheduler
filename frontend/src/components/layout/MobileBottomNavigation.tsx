import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { appNavigation } from "./appNavigation";

export const MobileBottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHidden =
    location.pathname === "/profile" || location.pathname === "/support";

  if (isHidden) {
    return null;
  }

  return (
    <Paper
      elevation={8}
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={(_, value: string) => navigate(value)}
        showLabels
        sx={{ height: 68 }}
      >
        {appNavigation.map((item) => (
          <BottomNavigationAction
            key={item.path}
            value={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};
