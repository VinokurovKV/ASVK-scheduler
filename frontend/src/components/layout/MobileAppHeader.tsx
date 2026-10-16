import {
  ArrowBack,
  Menu as MenuIcon,
  NotificationsNoneOutlined,
} from "@mui/icons-material";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

interface MobileAppHeaderProps {
  initials: string;
  onUserMenuOpen: (element: HTMLElement) => void;
}

export const MobileAppHeader = ({
  initials,
  onUserMenuOpen,
}: MobileAppHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isProfilePage = location.pathname === "/profile";
  const isSettingsPage = location.pathname === "/settings";
  const isActiveSessionsPage = location.pathname === "/settings/sessions";
  const isChangePasswordPage = location.pathname === "/settings/password";
  const isSupportPage = location.pathname === "/support";
  const isSystemPage = location.pathname === "/system";
  const isSubpage =
    isProfilePage ||
    isSettingsPage ||
    isActiveSessionsPage ||
    isChangePasswordPage ||
    isSupportPage ||
    isSystemPage;

  const parentPath =
    (
      location.state as {
        from?: string;
      } | null
    )?.from ?? "/";

  const handleBack = () => {
    if (isProfilePage || isSettingsPage) {
      navigate(parentPath);
      return;
    }

    navigate("/settings");
  };

  const title = isProfilePage
    ? "Профиль"
    : isSettingsPage
      ? "Настройки"
      : isActiveSessionsPage
        ? "Активные сессии"
        : isChangePasswordPage
          ? "Смена пароля"
          : isSupportPage
            ? "Поддержка"
            : isSystemPage
              ? "Система"
            : "ASVK Schedule";

  return (
    <Box
      component="header"
      sx={{
        display: { xs: "grid", md: "none" },
        position: "sticky",
        top: 0,
        zIndex: 1200,
        gridTemplateColumns: isSupportPage
          ? "48px minmax(0, 1fr) 48px"
          : "48px minmax(0, 1fr) 40px 48px",
        alignItems: "center",
        height: 64,
        px: 1,
        backgroundColor: "app.brand.navy",
        color: "common.white",
        boxShadow: (theme) => theme.appShadows.appBar,
      }}
    >
      {isSubpage ? (
        <IconButton
          onClick={handleBack}
          aria-label="Назад"
          sx={{ color: "common.white", justifySelf: "center" }}
        >
          <ArrowBack />
        </IconButton>
      ) : (
        <IconButton
          aria-label="Меню"
          sx={{ color: "common.white", justifySelf: "center" }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Typography
        variant="h6"
        sx={{
          minWidth: 0,
          fontWeight: isSubpage ? 600 : 700,
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>

      {!isSupportPage && (
        <IconButton
          aria-label="Уведомления"
          sx={{ justifySelf: "center", color: "common.white" }}
        >
          <NotificationsNoneOutlined />
        </IconButton>
      )}

      <IconButton
        aria-label="Меню пользователя"
        onClick={(event) => onUserMenuOpen(event.currentTarget)}
        sx={{ justifySelf: "center", p: 0.5 }}
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: "app.brand.navySoft",
            color: "app.brand.accent",
            fontSize: "0.82rem",
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>
      </IconButton>
    </Box>
  );
};
