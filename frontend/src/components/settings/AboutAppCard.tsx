import {
  ChatOutlined,
  ChevronRightRounded,
  SchoolRounded,
} from "@mui/icons-material";
import { Box, ButtonBase, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const AboutAppCard = () => {
  const navigate = useNavigate();

  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{
        display: "block",
        mt: { xs: 1.5, lg: 2 },
        borderRadius: 3,
        boxShadow: (theme) => theme.appShadows.button,
        p: { xs: 1.5, md: 2.5 },
      }}
    >
      <Typography component="h2" sx={{ fontSize: "1rem", fontWeight: 750 }}>
        О приложении
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: "none", md: "block" }, mt: 0.25 }}
      >
        Информация о версии, поддержка и полезные ссылки.
      </Typography>

      <Box
        sx={{
          display: { xs: "block", md: "grid" },
          mt: { xs: 0, md: 1.5 },
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ mt: { xs: 1.25, md: 0 }, alignItems: "center" }}
        >
          <Box
            sx={{
              display: "grid",
              width: 54,
              height: 54,
              flexShrink: 0,
              placeItems: "center",
              borderRadius: 2.25,
              bgcolor: "primary.main",
              color: "common.white",
            }}
          >
            <SchoolRounded sx={{ fontSize: 34 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 750 }}>ASVK Schedule</Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.2 }}
            >
              Версия 0.1.0
            </Typography>
          </Box>
        </Stack>

        <ButtonBase
          onClick={() =>
            navigate("/support", { state: { from: "/settings" } })
          }
          sx={{
            display: "flex",
            minHeight: { xs: 52, md: 64 },
            width: { xs: "100%", md: "calc(100% - 20px)" },
            mt: { xs: 1.25, md: 0 },
            ml: { md: 2.5 },
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "app.border.card",
            borderRadius: 2,
            gap: 1.25,
            px: { xs: 1, md: 1.5 },
            textAlign: "left",
          }}
        >
          <ChatOutlined sx={{ flexShrink: 0, color: "app.brand.accent" }} />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: "0.86rem", fontWeight: 600 }}>
              Поддержка
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", md: "block" }, mt: 0.1 }}
            >
              Связаться с командой
            </Typography>
          </Box>

          <ChevronRightRounded color="action" />
        </ButtonBase>
      </Box>
    </Paper>
  );
};
