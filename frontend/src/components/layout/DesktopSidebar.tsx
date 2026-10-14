import {
  ChevronLeft,
  ChevronRight,
  SchoolRounded,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import gzLogo from "../../assets/gzlogo.svg";
import { appNavigation } from "./appNavigation";

interface DesktopSidebarProps {
  collapsed: boolean;
  width: number;
  onToggle: () => void;
}

export const DesktopSidebar = ({
  collapsed,
  width,
  onToggle,
}: DesktopSidebarProps) => {
  const [isCollapseTooltipOpen, setIsCollapseTooltipOpen] = useState(false);

  const handleToggle = () => {
    setIsCollapseTooltipOpen(false);
    onToggle();
  };

  return (
    <Box
      component="aside"
      sx={{
        display: { xs: "none", md: "flex" },
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 1200,
        width,
        boxSizing: "border-box",
        flexDirection: "column",
        px: collapsed ? 1 : 2,
        py: 2,
        color: "common.white",
        bgcolor: "app.brand.navy",
        borderRight: "1px solid",
        borderRightColor: "app.border.sidebar",
        transition: "width 220ms ease, padding 220ms ease",
      }}
    >
      <Tooltip
        title={collapsed ? "Развернуть меню" : "Свернуть меню"}
        placement="right"
        open={isCollapseTooltipOpen}
        onOpen={() => setIsCollapseTooltipOpen(true)}
        onClose={() => setIsCollapseTooltipOpen(false)}
        disableInteractive
        slotProps={{
          popper: {
            modifiers: [
              { name: "offset", options: { offset: [0, -8] } },
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
            collapsed ? "Развернуть боковую панель" : "Свернуть боковую панель"
          }
          onClick={handleToggle}
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
          {collapsed ? (
            <ChevronRight sx={{ fontSize: 19 }} />
          ) : (
            <ChevronLeft sx={{ fontSize: 19 }} />
          )}
        </IconButton>
      </Tooltip>

      <Box
        sx={{
          display: "flex",
          minHeight: 64,
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 1.25,
          px: collapsed ? 0 : 0.5,
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
          <SchoolRounded sx={{ fontSize: 28, color: "app.navigation.icon" }} />
        </Box>

        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
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

      <List sx={{ mt: 2, px: 0 }}>
        {appNavigation.map((item) => (
          <Tooltip
            key={item.path}
            title={collapsed ? item.label : ""}
            placement="right"
          >
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path === "/"}
              sx={{
                minHeight: 48,
                mb: 0.75,
                px: collapsed ? 0 : 1.5,
                justifyContent: collapsed ? "center" : "flex-start",
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
                  "&:hover": { bgcolor: "app.navigation.active" },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 40,
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed && (
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
            width: collapsed ? 44 : "100%",
            maxWidth: 185,
            height: collapsed ? 46 : 105,
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

        {!collapsed && (
          <Box sx={{ width: "100%", mt: 1.25, textAlign: "center" }}>
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
  );
};
