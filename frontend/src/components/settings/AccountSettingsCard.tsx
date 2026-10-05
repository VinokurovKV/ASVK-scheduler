import {
  ChevronRightRounded,
  PersonOutlineRounded,
} from "@mui/icons-material";
import { Avatar, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { AuthUser } from "../../types/Auth";

interface AccountSettingsCardProps {
  user: AuthUser;
}

const getRoleLabel = (
  role: AuthUser["role"],
  groupNumber: AuthUser["groupNumber"],
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

export const AccountSettingsCard = ({ user }: AccountSettingsCardProps) => {
  const navigate = useNavigate();
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;
  const roleLabel = getRoleLabel(user.role, user.groupNumber);

  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{
        width: "100%",
        mt: { xs: 1.25, md: 0 },
        borderRadius: 3,
        boxShadow: (theme) => theme.appShadows.button,
        p: 1.5,
        pb: { md: 0.75 },
      }}
    >
      <Typography component="h2" sx={{ fontSize: "1rem", fontWeight: 750 }}>
        Аккаунт
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: "none", md: "block" }, mt: 0.25 }}
      >
        Управление личной информацией и профилем.
      </Typography>

      <Box
        sx={{
          display: { xs: "block", md: "grid" },
          mt: { xs: 0, md: 0.75 },
          gridTemplateColumns: { md: "64px minmax(0, 1fr)" },
          columnGap: 1.5,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            display: { xs: "flex", md: "contents" },
            mt: { xs: 1.25, md: 0 },
            minWidth: 0,
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              flexShrink: 0,
              bgcolor: "app.brand.navy",
              color: "common.white",
              fontSize: { xs: "1.2rem", md: "1.45rem" },
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                overflow: "hidden",
                fontWeight: 700,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {fullName}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {roleLabel}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 0.1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<PersonOutlineRounded />}
          endIcon={<ChevronRightRounded />}
          onClick={() =>
            navigate("/profile", { state: { from: "/settings" } })
          }
          sx={{
            width: { xs: "100%", md: "auto" },
            minWidth: { md: 190 },
            mt: { xs: 1.5, md: 0.5 },
            gridColumn: { md: 2 },
            justifySelf: { md: "end" },
            minHeight: { xs: 42, md: 36 },
            justifyContent: "flex-start",
            borderColor: "divider",
            borderRadius: 2.5,
            color: "text.primary",
            textTransform: "none",
            "& .MuiButton-endIcon": { ml: "auto" },
          }}
        >
          Изменить профиль
        </Button>
      </Box>
    </Paper>
  );
};
