import { Box, Stack, Typography } from "@mui/material";

import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileEditControls } from "./ProfileEditControls";
import { ProfileFields } from "./ProfileFields";
import type { ProfileViewProps } from "./profileViewTypes";

export const MobileProfileView = ({
  values,
  initials,
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
  <Box sx={{ display: { xs: "block", md: "none" } }}>
    <Box
      sx={{
        bgcolor: "background.default",
        px: 2,
        pt: 2,
        pb: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        spacing={1.5}
        sx={{ width: "100%", maxWidth: 520, mx: "auto", alignItems: "center" }}
      >
        <ProfileAvatar
          variant="mobile"
          initials={initials}
          isEditing={isEditing}
          onMenuOpen={onAvatarMenuOpen}
        />

        <Box sx={{ position: "relative", width: "100%", minHeight: 36 }}>
          <Typography
            variant="h5"
            sx={{
              width: "fit-content",
              maxWidth: "calc(100% - 88px)",
              mx: "auto",
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: "center",
              whiteSpace: "normal",
              wordBreak: "normal",
              overflowWrap: "normal",
            }}
          >
            {values.firstName} {values.lastName}
          </Typography>

          <ProfileEditControls
            variant="mobile"
            isEditing={isEditing}
            isFormValid={isFormValid}
            isPending={isPending}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          {roleLabel}
          {isStudent && values.groupNumber ? ` · ${values.groupNumber}` : ""}
        </Typography>
      </Stack>
    </Box>

    <ProfileFields
      variant="mobile"
      values={values}
      roleLabel={roleLabel}
      isStudent={isStudent}
      isEditing={isEditing}
      hasRejectedValue={hasRejectedValue}
      onValueChange={onValueChange}
    />
  </Box>
);
