import {
  CalendarToday,
  KeyboardArrowDown,
  NotificationsNoneOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  ButtonBase,
  IconButton,
  Typography,
} from "@mui/material";
import { getAvatarColorSx } from "../../constants/avatarColors";
import type { AvatarColor } from "../../types/Auth";

interface DesktopAppHeaderProps {
  sidebarWidth: number;
  height: number;
  initials: string;
  avatarColor?: AvatarColor;
  userName: string;
  userRoleLabel: string;
  onUserMenuOpen: (element: HTMLElement) => void;
}

const formatCurrentDate = () => {
  const formattedDate = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};

export const DesktopAppHeader = ({
  sidebarWidth,
  height,
  initials,
  avatarColor,
  userName,
  userRoleLabel,
  onUserMenuOpen,
}: DesktopAppHeaderProps) => (
  <Box
    component="header"
    sx={{
      display: { xs: "none", md: "flex" },
      position: "fixed",
      top: 0,
      right: 0,
      left: sidebarWidth,
      zIndex: 1100,
      height,
      alignItems: "center",
      justifyContent: "space-between",
      px: 3,
      bgcolor: "app.brand.navy",
      color: "common.white",
      boxShadow: (theme) => theme.appShadows.topBar,
      transition: "left 220ms ease",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <CalendarToday sx={{ fontSize: 22, color: "app.navigation.icon" }} />
      <Typography sx={{ fontWeight: 600 }}>{formatCurrentDate()}</Typography>
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <IconButton aria-label="Уведомления" sx={{ color: "common.white" }}>
        <NotificationsNoneOutlined />
      </IconButton>

      <ButtonBase
        aria-label="Меню пользователя"
        onClick={(event) => onUserMenuOpen(event.currentTarget)}
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
          "&:hover": { bgcolor: "app.navigation.hover" },
        }}
      >
        <Avatar
          sx={[
            {
              width: 40,
              height: 40,
              fontSize: "0.9rem",
              fontWeight: 700,
            },
            getAvatarColorSx(avatarColor),
          ]}
        >
          {initials}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
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
            {userName}
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
          sx={{ ml: 0.25, fontSize: 20, color: "app.text.onDarkSecondary" }}
        />
      </ButtonBase>
    </Box>
  </Box>
);
