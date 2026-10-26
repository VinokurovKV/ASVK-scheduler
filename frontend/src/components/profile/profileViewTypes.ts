import type {
  ProfileField,
  ProfileFormValues,
  ProfileValueChangeHandler,
} from "./profileTypes";

export interface ProfileViewProps {
  values: ProfileFormValues;
  initials: string;
  avatarColor: ProfileFormValues["avatarColor"];
  roleLabel: string;
  isStudent: boolean;
  isEditing: boolean;
  isFormValid: boolean;
  isPending: boolean;
  hasRejectedValue: (field: ProfileField, value: string) => boolean;
  onValueChange: ProfileValueChangeHandler;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAvatarMenuOpen: (anchor: HTMLElement) => void;
}
