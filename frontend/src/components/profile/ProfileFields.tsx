import { Box, MenuItem, TextField } from "@mui/material";

import { getProfileFieldStyles } from "./profileFieldStyles";
import {
  type ProfileField,
  type ProfileFormValues,
  type ProfileValueChangeHandler,
  roleLabels,
  roleOptions,
  studentGroups,
  type UserRole,
} from "./profileTypes";

interface ProfileFieldsProps {
  variant: "mobile" | "desktop";
  values: ProfileFormValues;
  roleLabel: string;
  isStudent: boolean;
  isEditing: boolean;
  hasRejectedValue: (field: ProfileField, value: string) => boolean;
  onValueChange: ProfileValueChangeHandler;
}

export const ProfileFields = ({
  variant,
  values,
  roleLabel,
  isStudent,
  isEditing,
  hasRejectedValue,
  onValueChange,
}: ProfileFieldsProps) => {
  const isDesktop = variant === "desktop";

  return (
    <Box
      sx={
        isDesktop
          ? {
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 2.5,
              p: 3,
            }
          : {
              display: "grid",
              width: "100%",
              maxWidth: 520,
              mx: "auto",
              px: 2,
              py: 2,
              gap: 2,
            }
      }
    >
      <ProfileTextField
        label="Имя"
        field="firstName"
        value={values.firstName}
        isEditing={isEditing}
        error={hasRejectedValue("firstName", values.firstName)}
        onValueChange={onValueChange}
      />
      <ProfileTextField
        label="Фамилия"
        field="lastName"
        value={values.lastName}
        isEditing={isEditing}
        error={hasRejectedValue("lastName", values.lastName)}
        onValueChange={onValueChange}
      />
      <ProfileTextField
        label="Логин"
        field="username"
        value={values.username}
        isEditing={isEditing}
        error={hasRejectedValue("username", values.username)}
        onValueChange={onValueChange}
      />
      <ProfileTextField
        label="Почта"
        field="email"
        value={values.email}
        isEditing={isEditing}
        error={hasRejectedValue("email", values.email)}
        onValueChange={onValueChange}
      />

      {isEditing ? (
        <TextField
          select
          label="Роль"
          value={values.role ?? ""}
          error={hasRejectedValue("role", values.role ?? "")}
          onChange={(event) =>
            onValueChange("role", event.target.value as UserRole)
          }
          fullWidth
          sx={getProfileFieldStyles(true)}
        >
          {isDesktop && (
            <MenuItem value="" disabled>
              Выберите роль
            </MenuItem>
          )}
          {roleOptions.map((role) => (
            <MenuItem key={role} value={role}>
              {roleLabels[role]}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <TextField
          label="Роль"
          value={roleLabel}
          fullWidth
          slotProps={{ input: { readOnly: true } }}
          sx={getProfileFieldStyles(false)}
        />
      )}

      {isStudent &&
        (isEditing ? (
          <TextField
            select
            label="Группа"
            value={values.groupNumber}
            error={hasRejectedValue("groupNumber", values.groupNumber)}
            onChange={(event) =>
              onValueChange("groupNumber", event.target.value)
            }
            fullWidth
            sx={getProfileFieldStyles(true)}
          >
            {isDesktop && (
              <MenuItem value="" disabled>
                Выберите группу
              </MenuItem>
            )}
            {studentGroups.map((group) => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            label="Группа"
            value={values.groupNumber}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
            sx={getProfileFieldStyles(false)}
          />
        ))}
    </Box>
  );
};

interface ProfileTextFieldProps {
  label: string;
  field: "firstName" | "lastName" | "username" | "email";
  value: string;
  isEditing: boolean;
  error: boolean;
  onValueChange: ProfileValueChangeHandler;
}

const ProfileTextField = ({
  label,
  field,
  value,
  isEditing,
  error,
  onValueChange,
}: ProfileTextFieldProps) => (
  <TextField
    label={label}
    value={value}
    onChange={(event) => onValueChange(field, event.target.value)}
    error={error}
    fullWidth
    slotProps={{ input: { readOnly: !isEditing } }}
    sx={getProfileFieldStyles(isEditing)}
  />
);
