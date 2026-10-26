import { CheckRounded } from "@mui/icons-material";
import { Box, IconButton, Popover, Typography } from "@mui/material";

import {
  avatarColorOptions,
  getAvatarColorSx,
} from "../../constants/avatarColors";
import type { AvatarColor } from "../../types/Auth";

interface ProfileAvatarMenuProps {
  anchor: HTMLElement | null;
  selectedColor: AvatarColor;
  onColorSelect: (color: AvatarColor) => void;
  onClose: () => void;
}

export const ProfileAvatarMenu = ({
  anchor,
  selectedColor,
  onColorSelect,
  onClose,
}: ProfileAvatarMenuProps) => (
  <Popover
    anchorEl={anchor}
    open={Boolean(anchor)}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    transformOrigin={{ vertical: "top", horizontal: "center" }}
    slotProps={{
      paper: {
        sx: {
          mt: 1,
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.paper",
        },
      },
    }}
  >
    <Typography sx={{ mb: 1.5, fontWeight: 700 }}>Цвет аватара</Typography>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 38px)",
        gap: 1,
      }}
    >
      {avatarColorOptions.map((option, index) => {
        const selected = option.value === selectedColor;

        return (
          <IconButton
            key={option.value}
            aria-label={`Выбрать цвет аватара ${index + 1}`}
            aria-pressed={selected}
            onClick={() => onColorSelect(option.value)}
            sx={[
              {
                width: 38,
                height: 38,
                border: "2px solid",
                borderColor: selected ? "text.primary" : "transparent",
                boxShadow: selected
                  ? (theme) => `0 0 0 2px ${theme.vars.palette.background.paper}`
                  : "none",
                "&:hover": { filter: "brightness(1.06)" },
              },
              getAvatarColorSx(option.value),
            ]}
          >
            {selected && <CheckRounded sx={{ fontSize: 20 }} />}
          </IconButton>
        );
      })}
    </Box>
  </Popover>
);
