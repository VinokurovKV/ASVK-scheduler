import { EditOutlined } from "@mui/icons-material";
import { Avatar, Box, IconButton } from "@mui/material";
import type { AvatarColor } from "../../types/Auth";
import { getAvatarColorSx } from "../../constants/avatarColors";

interface ProfileAvatarProps {
  variant: "mobile" | "desktop";
  initials: string;
  avatarColor: AvatarColor;
  isEditing: boolean;
  onMenuOpen: (anchor: HTMLElement) => void;
}

export const ProfileAvatar = ({
  variant,
  initials,
  avatarColor,
  isEditing,
  onMenuOpen,
}: ProfileAvatarProps) => {
  const isDesktop = variant === "desktop";
  const avatarSize = isDesktop ? 112 : 88;
  const buttonSize = isDesktop ? 34 : 30;

  return (
    <Box sx={{ position: "relative", width: isDesktop ? "fit-content" : null }}>
      <Avatar
        sx={[
          {
            width: avatarSize,
            height: avatarSize,
            fontSize: isDesktop ? "2rem" : "1.75rem",
            fontWeight: 700,
          },
          getAvatarColorSx(avatarColor),
        ]}
      >
        {initials}
      </Avatar>

      {isEditing && (
        <IconButton
          size="small"
          aria-label="Изменить аватар"
          onClick={(event) =>
            onMenuOpen(
              (event.currentTarget.previousElementSibling as HTMLElement) ??
                event.currentTarget,
            )
          }
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
