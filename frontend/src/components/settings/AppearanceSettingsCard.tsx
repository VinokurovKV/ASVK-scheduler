import {
  DarkModeOutlined,
  DesktopWindowsOutlined,
  LightModeOutlined,
} from "@mui/icons-material";
import { Box, ButtonBase, Paper, Typography } from "@mui/material";

import { useAppTheme } from "../../theme/theme-context";

const appearanceOptions = [
  {
    value: "light",
    mobileLabel: "Светлая",
    label: "Светлая тема",
    description: "Чистый и светлый интерфейс",
    icon: <LightModeOutlined />,
  },
  {
    value: "dark",
    mobileLabel: "Тёмная",
    label: "Тёмная тема",
    description: "Тёмный интерфейс для комфортной работы",
    icon: <DarkModeOutlined />,
  },
  {
    value: "system",
    mobileLabel: "Системная",
    label: "Системная тема",
    description: "Автоматическое переключение",
    icon: <DesktopWindowsOutlined />,
  },
] as const;

export const AppearanceSettingsCard = () => {
  const { themePreference, setThemePreference } = useAppTheme();

  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{
        display: "block",
        mt: { xs: 1.5, md: 1.5, lg: 0 },
        borderRadius: 3,
        boxShadow: (theme) => theme.appShadows.button,
        p: 1.5,
        pb: { md: 0.75 },
      }}
    >
      <Typography component="h2" sx={{ fontSize: "1rem", fontWeight: 750 }}>
        Внешний вид
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: "none", md: "block" }, mt: 0.25 }}
      >
        Выберите, как будет выглядеть приложение.
      </Typography>

      <Box
        sx={{
          display: "grid",
          mt: { xs: 1.25, md: 0.75 },
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 1,
        }}
      >
        {appearanceOptions.map((option) => {
          const isSelected = option.value === themePreference;

          return (
            <ButtonBase
              key={option.value}
              onClick={() => setThemePreference(option.value)}
              aria-label={option.label}
              aria-pressed={isSelected}
              sx={{
                position: "relative",
                display: "flex",
                minWidth: 0,
                minHeight: { xs: 72, md: 88 },
                border: "1px solid",
                borderColor: isSelected ? "primary.main" : "divider",
                borderRadius: 2.5,
                bgcolor: isSelected
                  ? "app.brand.navySoft"
                  : "background.paper",
                flexDirection: "column",
                alignItems: { xs: "center", md: "flex-start" },
                justifyContent: { xs: "center", md: "flex-start" },
                gap: { xs: 0.4, md: 0 },
                px: { xs: 0.5, md: 1.5 },
                py: { xs: 0.75, md: 1.25 },
                color: isSelected ? "primary.main" : "text.primary",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  height: { md: 28 },
                  placeItems: "center",
                  mb: { md: 0.5 },
                  "& svg": { fontSize: { xs: 23, md: 27 } },
                }}
              >
                {option.icon}
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: "text.primary",
                  fontWeight: 650,
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                }}
              >
                <Box
                  component="span"
                  sx={{ display: { xs: "inline", md: "none" } }}
                >
                  {option.mobileLabel}
                </Box>

                <Box
                  component="span"
                  sx={{ display: { xs: "none", md: "inline" } }}
                >
                  {option.label}
                </Box>
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display: { xs: "none", md: "block" },
                  width: "100%",
                  minHeight: 34,
                  mt: 0.35,
                  color: "text.secondary",
                  fontSize: "0.68rem",
                  lineHeight: 1.25,
                  textAlign: "left",
                }}
              >
                {option.description}
              </Typography>

              <Box
                aria-hidden="true"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 11,
                  height: 11,
                  border: "1.5px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  borderRadius: "50%",
                  bgcolor: isSelected ? "primary.main" : "transparent",
                  boxShadow: isSelected
                    ? (theme) =>
                        `inset 0 0 0 2px ${theme.vars.palette.background.paper}`
                    : "none",
                }}
              />
            </ButtonBase>
          );
        })}
      </Box>
    </Paper>
  );
};
