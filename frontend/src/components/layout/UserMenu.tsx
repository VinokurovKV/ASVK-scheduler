import { Logout, PersonOutlined, SettingsOutlined } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

interface UserMenuProps {
  anchor: HTMLElement | null;
  arrowRight: number;
  initials: string;
  userName: string;
  userRoleLabel: string;
  logoutPending: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const UserMenu = ({
  anchor,
  arrowRight,
  initials,
  userName,
  userRoleLabel,
  logoutPending,
  onClose,
  onLogout,
}: UserMenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    onClose();

    if (location.pathname === path) {
      return;
    }

    navigate(path, { state: { from: location.pathname } });
  };

  return (
    <Menu
      anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
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
              right: { xs: `${arrowRight - 5}px`, md: `${arrowRight}px` },
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

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userName}
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

      <MenuItem
        onClick={() => handleNavigation("/profile")}
        selected={location.pathname === "/profile"}
      >
        <ListItemIcon>
          <PersonOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText>Профиль</ListItemText>
      </MenuItem>

      <MenuItem
        onClick={() => handleNavigation("/settings")}
        selected={location.pathname === "/settings"}
      >
        <ListItemIcon>
          <SettingsOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText>Настройки</ListItemText>
      </MenuItem>

      <Divider />

      <MenuItem
        onClick={onLogout}
        disabled={logoutPending}
        sx={{ color: "error.main" }}
      >
        <ListItemIcon sx={{ color: "inherit" }}>
          <Logout fontSize="small" />
        </ListItemIcon>
        <ListItemText>Выйти</ListItemText>
      </MenuItem>
    </Menu>
  );
};
