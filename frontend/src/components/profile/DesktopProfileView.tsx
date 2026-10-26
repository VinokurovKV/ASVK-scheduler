import { Box, Paper, Typography } from "@mui/material";

import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileEditControls } from "./ProfileEditControls";
import { ProfileFields } from "./ProfileFields";
import type { ProfileViewProps } from "./profileViewTypes";

export const DesktopProfileView = ({
  values,
  initials,
  avatarColor,
  roleLabel,
  isStudent,
  isEditing,
  isFormValid,
  isPending,
  hasRejectedValue,
  onValueChange,
  onEdit,
  onSave,
  onCancel,
  onAvatarMenuOpen,
}: ProfileViewProps) => (
  <Box
    sx={{
      display: { xs: "none", md: "block" },
      width: "100%",
      maxWidth: 1120,
      mx: "auto",
    }}
  >
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        sx={{ color: "app.brand.accent", fontWeight: 700, lineHeight: 1.2 }}
      >
        Профиль
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        Личные данные и информация об аккаунте
      </Typography>
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "300px minmax(0, 1fr)",
        gap: 3,
        alignItems: "stretch",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.paper",
          textAlign: "center",
        }}
      >
        <Box sx={{ width: "fit-content", mx: "auto" }}>
          <ProfileAvatar
            variant="desktop"
            initials={initials}
            avatarColor={avatarColor}
            isEditing={isEditing}
            onMenuOpen={onAvatarMenuOpen}
          />
        </Box>

        <Typography
          variant="h5"
          sx={{
            mt: 2.5,
            color: "app.brand.accent",
            fontWeight: 700,
            lineHeight: 1.25,
            overflowWrap: "anywhere",
          }}
        >
          {values.firstName} {values.lastName}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {roleLabel}
        </Typography>

        {isStudent && values.groupNumber && (
          <Box
            sx={{
              width: "fit-content",
              mx: "auto",
              mt: 1.5,
              px: 1.5,
              py: 0.6,
              bgcolor: "app.brand.navySoft",
              color: "app.brand.accent",
              borderRadius: 10,
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            Группа {values.groupNumber}
          </Box>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            minHeight: 76,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "app.brand.accent", fontWeight: 700 }}
            >
              Личные данные
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              Основная информация профиля
            </Typography>
          </Box>

          <ProfileEditControls
            variant="desktop"
            isEditing={isEditing}
            isFormValid={isFormValid}
            isPending={isPending}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
          />
        </Box>

        <ProfileFields
          variant="desktop"
          values={values}
          roleLabel={roleLabel}
          isStudent={isStudent}
          isEditing={isEditing}
          hasRejectedValue={hasRejectedValue}
          onValueChange={onValueChange}
        />
      </Paper>
    </Box>
  </Box>
);
