import { Box } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { getCurrentUser, logout } from "../api/auth";
import { AUTH_QUERY_KEY } from "../api/authQuery";
import { DesktopAppHeader } from "../components/layout/DesktopAppHeader";
import { DesktopSidebar } from "../components/layout/DesktopSidebar";
import { LogoutConfirmation } from "../components/layout/LogoutConfirmation";
import { MobileAppHeader } from "../components/layout/MobileAppHeader";
import { MobileBottomNavigation } from "../components/layout/MobileBottomNavigation";
import { UserMenu } from "../components/layout/UserMenu";

const EXPANDED_SIDEBAR_WIDTH = 240;
const COLLAPSED_SIDEBAR_WIDTH = 72;
const DESKTOP_HEADER_HEIGHT = 72;

const getUserRoleLabel = (
  role: "STUDENT" | "POSTGRADUATE" | "EMPLOYEE" | null | undefined,
  groupNumber: string | null | undefined,
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

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
    useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [menuArrowRight, setMenuArrowRight] = useState(14);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

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
      navigate("/login", { replace: true });
    },
  });

  const isProfilePage = location.pathname === "/profile";
  const isSupportPage = location.pathname === "/support";
  const currentSidebarWidth = isSidebarCollapsed
    ? COLLAPSED_SIDEBAR_WIDTH
    : EXPANDED_SIDEBAR_WIDTH;
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();
  const userName = user?.name ?? "Пользователь";
  const userRoleLabel = getUserRoleLabel(user?.role, user?.groupNumber);
  const isOwner = user?.appRoles.includes("OWNER") === true;

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

  const handleLogoutClick = () => {
    setUserMenuAnchor(null);
    setIsLogoutConfirmationOpen(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        background: (theme) =>
          `linear-gradient(to bottom, ${theme.vars.palette.app.brand.navy} 0, ${theme.vars.palette.app.brand.navy} 92px, ${theme.vars.palette.background.default} 92px, ${theme.vars.palette.background.default} 100%)`,
      }}
    >
      <MobileAppHeader
        initials={initials}
        avatarColor={user?.avatarColor}
        onUserMenuOpen={handleUserMenuOpen}
      />

      <DesktopSidebar
        collapsed={isSidebarCollapsed}
        width={currentSidebarWidth}
        onToggle={() => setIsSidebarCollapsed((value) => !value)}
      />

      <DesktopAppHeader
        sidebarWidth={currentSidebarWidth}
        height={DESKTOP_HEADER_HEIGHT}
        initials={initials}
        avatarColor={user?.avatarColor}
        userName={userName}
        userRoleLabel={userRoleLabel}
        onUserMenuOpen={handleUserMenuOpen}
      />

      <UserMenu
        anchor={userMenuAnchor}
        arrowRight={menuArrowRight}
        initials={initials}
        avatarColor={user?.avatarColor}
        userName={userName}
        userRoleLabel={userRoleLabel}
        isOwner={isOwner}
        logoutPending={logoutMutation.isPending}
        onClose={() => setUserMenuAnchor(null)}
        onLogout={handleLogoutClick}
      />

      <LogoutConfirmation
        open={isLogoutConfirmationOpen}
        pending={logoutMutation.isPending}
        onClose={() => setIsLogoutConfirmationOpen(false)}
        onConfirm={() => logoutMutation.mutate()}
      />

      <Box
        component="main"
        sx={{
          ml: { xs: 0, md: `${currentSidebarWidth}px` },
          mt: { xs: 0, md: `${DESKTOP_HEADER_HEIGHT}px` },
          minHeight: {
            xs: "calc(100dvh - 64px)",
            md: `calc(100dvh - ${DESKTOP_HEADER_HEIGHT}px)`,
          },
          overflow: isProfilePage ? "visible" : "hidden",
          px: { xs: isProfilePage ? 0 : 2, md: 4 },
          pt: { xs: isProfilePage ? 0 : 2, md: 4 },
          pb: {
            xs: isProfilePage ? 0 : isSupportPage ? 2 : 10,
            md: 4,
          },
          bgcolor: "background.default",
          borderTopLeftRadius: { xs: "20px", md: "20px" },
          borderTopRightRadius: { xs: "20px", md: 0 },
          transition: "margin-left 220ms ease",
        }}
      >
        <Outlet />
      </Box>

      <MobileBottomNavigation />
    </Box>
  );
};
