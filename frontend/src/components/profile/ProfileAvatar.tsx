import { EditOutlined } from "@mui/icons-material";
import { Avatar, Box, IconButton } from "@mui/material";
import type { MouseEvent } from "react";

interface ProfileAvatarProps {
  variant: "mobile" | "desktop";
  initials: string;
  isEditing: boolean;
  onMenuOpen: (event: MouseEvent<HTMLElement>) => void;
}

export const ProfileAvatar = ({
  variant,
  initials,
  isEditing,
  onMenuOpen,
}: ProfileAvatarProps) => {
  const isDesktop = variant === "desktop";
  const avatarSize = isDesktop ? 112 : 88;
  const buttonSize = isDesktop ? 34 : 30;

  return (
    <Box sx={{ position: "relative", width: isDesktop ? "fit-content" : null }}>
      <Avatar
        sx={{
          width: avatarSize,
          height: avatarSize,
          bgcolor: "app.brand.navy",
          color: "common.white",
          fontSize: isDesktop ? "2rem" : "1.75rem",
          fontWeight: 700,
        }}
      >
        {initials}
      </Avatar>

      {isEditing && (
        <IconButton
          size="small"
          aria-label="Изменить аватар"
          onClick={onMenuOpen}
          sx={{
            position: "absolute",
            right: -4,
            bottom: -4,
            width: buttonSize,
            height: buttonSize,
            bgcolor: "app.brand.navySoft",
            color: "app.brand.accent",
            border: "2px solid",
            borderColor: "background.paper",
            boxShadow: (theme) => theme.appShadows.avatar,
            "&:hover": { bgcolor: "app.brand.navySoft" },
          }}
        >
          <EditOutlined sx={{ fontSize: isDesktop ? 18 : 16 }} />
        </IconButton>
      )}
    </Box>
  );
};
