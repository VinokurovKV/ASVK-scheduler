import { Box, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../api/auth";
import { AUTH_QUERY_KEY } from "../api/authQuery";
import { DesktopProfileView } from "../components/profile/DesktopProfileView";
import { MobileProfileView } from "../components/profile/MobileProfileView";
import { ProfileAvatarMenu } from "../components/profile/ProfileAvatarMenu";
import { ProfileToasts } from "../components/profile/ProfileToasts";
import { useProfileEditor } from "../components/profile/useProfileEditor";
import type { AuthUser } from "../types/Auth";

export const ProfilePage = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
  });

  if (isLoading || !user) {
    return (
      <Box
        sx={{ display: "grid", minHeight: "100dvh", placeItems: "center" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <ProfileContent key={user.id} user={user} />;
};

const ProfileContent = ({ user }: { user: AuthUser }) => {
  const editor = useProfileEditor(user);
  const viewProps = {
    values: editor.values,
    initials: editor.initials,
    roleLabel: editor.roleLabel,
    isStudent: editor.isStudent,
    isEditing: editor.isEditing,
    isFormValid: editor.isFormValid,
    isPending: editor.isPending,
    hasRejectedValue: editor.hasRejectedValue,
    onValueChange: editor.setValue,
    onEdit: editor.startEditing,
    onSave: editor.save,
    onCancel: editor.cancelEditing,
    onAvatarMenuOpen: editor.openAvatarMenu,
  };

  return (
    <Box
      sx={{
        minHeight: { xs: "calc(100dvh - 64px)", md: "auto" },
        bgcolor: "background.default",
      }}
    >
      <MobileProfileView {...viewProps} />
      <DesktopProfileView {...viewProps} />

      <ProfileAvatarMenu
        anchor={editor.avatarMenuAnchor}
        onClose={editor.closeAvatarMenu}
      />

      <ProfileToasts
        errors={editor.errorToasts}
        successOpen={editor.isSuccessToastOpen}
        onErrorClose={editor.removeErrorToast}
        onSuccessClose={editor.hideSuccessToast}
      />
    </Box>
  );
};
