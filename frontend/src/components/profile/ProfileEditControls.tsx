import {
  CheckRounded,
  CloseRounded,
  EditOutlined,
} from "@mui/icons-material";
import { CircularProgress, IconButton, Stack } from "@mui/material";

interface ProfileEditControlsProps {
  variant: "mobile" | "desktop";
  isEditing: boolean;
  isFormValid: boolean;
  isPending: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileEditControls = ({
  variant,
  isEditing,
  isFormValid,
  isPending,
  onEdit,
  onSave,
  onCancel,
}: ProfileEditControlsProps) => {
  const isDesktop = variant === "desktop";
  const buttonSize = isDesktop ? 38 : 34;
  const editButton = (
    <IconButton
      size={isDesktop ? "medium" : "small"}
      aria-label={isEditing ? "Сохранить изменения" : "Редактировать профиль"}
      onClick={isEditing ? onSave : onEdit}
      disabled={isEditing && (!isFormValid || isPending)}
      sx={{
        ...(!isDesktop && {
          position: "absolute",
          top: -3,
          right: 0,
        }),
        width: buttonSize,
        height: buttonSize,
        color: isEditing ? "app.status.success.text" : "app.brand.accent",
        bgcolor: isEditing
          ? "app.status.success.surface"
          : "app.brand.navySoft",
        border: "1px solid",
        borderColor: isEditing
          ? "app.status.success.border"
          : "app.border.field",
        boxShadow: (theme) => theme.appShadows.button,
        "&:hover": {
          bgcolor: isEditing
            ? "app.status.success.surface"
            : "app.brand.navySoft",
        },
        "&.Mui-disabled": { bgcolor: "app.background.field" },
      }}
    >
      {isEditing ? (
        isPending ? (
          <CircularProgress size={isDesktop ? 18 : 17} />
        ) : (
          <CheckRounded sx={{ fontSize: isDesktop ? 21 : 19 }} />
        )
      ) : (
        <EditOutlined sx={{ fontSize: isDesktop ? 20 : 18 }} />
      )}
    </IconButton>
  );

  const cancelButton = isEditing ? (
    <IconButton
      size={isDesktop ? "medium" : "small"}
      aria-label="Отменить изменения"
      onClick={onCancel}
      disabled={isPending}
      sx={{
        ...(!isDesktop && {
          position: "absolute",
          top: 37,
          right: 0,
        }),
        width: buttonSize,
        height: buttonSize,
        color: "error.main",
        bgcolor: "app.status.error.surface",
        border: "1px solid",
        borderColor: "app.status.error.border",
        boxShadow: (theme) => theme.appShadows.button,
        "&:hover": { bgcolor: "app.status.error.surface" },
      }}
    >
      <CloseRounded sx={{ fontSize: isDesktop ? 21 : 19 }} />
    </IconButton>
  ) : null;

  if (!isDesktop) {
    return (
      <>
        {editButton}
        {cancelButton}
      </>
    );
  }

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      {cancelButton}
      {editButton}
    </Stack>
  );
};
