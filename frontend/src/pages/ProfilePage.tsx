import {
  CheckRounded,
  CloseRounded,
  DeleteOutlined,
  EditOutlined,
  PhotoCameraOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type MouseEvent, useRef, useState } from "react";

import { AuthApiError, getCurrentUser, updateCurrentUser } from "../api/auth";

import { AUTH_QUERY_KEY } from "../api/authQuery";

import type { AuthUser } from "../types/Auth";

type UserRole = NonNullable<AuthUser["role"]>;

const roleLabels: Record<UserRole, string> = {
  STUDENT: "Студент",
  POSTGRADUATE: "Аспирант",
  EMPLOYEE: "Сотрудник",
};

const roleOptions: UserRole[] = [
  "STUDENT",
  "POSTGRADUATE",
  "EMPLOYEE",
];

const groups = ["321", "421", "521", "621"];

type ProfileField =
  | "firstName"
  | "lastName"
  | "username"
  | "email"
  | "role"
  | "groupNumber";

type RejectedValues = Partial<Record<ProfileField, string>>;

interface ErrorToast {
  id: number;
  message: string;
}

interface ProfileContentProps {
  user: AuthUser;
}

const getFieldStyles = (isEditing: boolean) => ({
  "& .MuiOutlinedInput-root": {
    bgcolor: isEditing ? "background.paper" : "app.background.field",

    transition: "background-color 0.2s ease, border-color 0.2s ease",

    "& fieldset": {
      borderColor: isEditing ? "app.border.field" : "transparent",
    },

    "&:hover fieldset": {
      borderColor: isEditing ? "app.border.field" : "transparent",
    },

    "&.Mui-focused fieldset": {
      borderColor: "app.brand.navy",
    },

    "&.Mui-error": {
      "& fieldset": {
        borderColor: "error.main",
      },

      "&:hover fieldset": {
        borderColor: "error.main",
      },

      "&.Mui-focused fieldset": {
        borderColor: "error.main",
      },
    },
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "app.brand.navy",
  },

  "& .MuiInputLabel-root.Mui-error": {
    color: "error.main",
  },

  "& .MuiInputBase-input": {
    cursor: isEditing ? "text" : "default",
  },
});

const isProfileField = (value: string): value is ProfileField => {
  return [
    "firstName",
    "lastName",
    "username",
    "email",
    "role",
    "groupNumber",
  ].includes(value);
};

const translateErrorMessage = (message: string) => {
  switch (message) {
    case "Username is already in use":
      return "Этот логин уже занят";

    case "Email is already in use":
      return "Эта почта уже используется другим аккаунтом";

    case "Username has an invalid format":
      return "Логин имеет неверный формат";

    case "Email has an invalid format":
      return "Почта имеет неверный формат";

    case "First name has an invalid format":
      return "Имя имеет неверный формат";

    case "Last name has an invalid format":
      return "Фамилия имеет неверный формат";

    case "Student group has an invalid value":
      return "Выбрана некорректная группа";

    case "Role has an invalid value":
      return "Выбрана некорректная роль";

    default:
      return "Не удалось сохранить изменения";
  }
};

const getFieldForMessage = (message: string): ProfileField | null => {
  switch (message) {
    case "Username is already in use":
    case "Username has an invalid format":
      return "username";

    case "Email is already in use":
    case "Email has an invalid format":
      return "email";

    case "First name has an invalid format":
      return "firstName";

    case "Last name has an invalid format":
      return "lastName";

    case "Student group has an invalid value":
      return "groupNumber";

    case "Role has an invalid value":
      return "role";

    default:
      return null;
  }
};

export const ProfilePage = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
  });

  if (isLoading || !user) {
    return (
      <Box
        sx={{
          display: "grid",
          minHeight: "100dvh",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <ProfileContent key={user.id} user={user} />;
};

const ProfileContent = ({ user }: ProfileContentProps) => {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState(user.firstName ?? "");

  const [lastName, setLastName] = useState(user.lastName ?? "");

  const [username, setUsername] = useState(user.username ?? "");

  const [email, setEmail] = useState(user.email);

  const [role, setRole] = useState<UserRole | null>(user.role);

  const [groupNumber, setGroupNumber] = useState(user.groupNumber ?? "");

  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

  const [rejectedValues, setRejectedValues] = useState<RejectedValues>({});

  const [errorToasts, setErrorToasts] = useState<ErrorToast[]>([]);

  const [isSuccessToastOpen, setIsSuccessToastOpen] = useState(false);

  const successToastTimerRef = useRef<number | null>(null);

  const toastIdRef = useRef(0);

  const toastTimersRef = useRef<Record<number, number>>({});

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  const roleLabel = role !== null ? roleLabels[role] : "Пользователь";

  const isStudent = role === "STUDENT";

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length >= 3 &&
    email.trim().length > 0 &&
    role !== null &&
    (!isStudent || groupNumber.length > 0);

  const hasProfileChanges =
    firstName.trim() !== (user.firstName ?? "").trim() ||
    lastName.trim() !== (user.lastName ?? "").trim() ||
    username.trim() !== (user.username ?? "").trim() ||
    email.trim() !== user.email.trim() ||
    role !== user.role ||
    (isStudent
      ? groupNumber !== (user.groupNumber ?? "")
      : user.groupNumber !== null && user.groupNumber !== undefined);

  const normalizeRejectedValue = (field: ProfileField, value: string) => {
    const trimmedValue = value.trim();

    if (field === "username" || field === "email") {
      return trimmedValue.toLowerCase();
    }

    return trimmedValue;
  };

  const getCurrentFieldValue = (field: ProfileField) => {
    switch (field) {
      case "firstName":
        return firstName;

      case "lastName":
        return lastName;

      case "username":
        return username;

      case "email":
        return email;

      case "role":
        return role ?? "";

      case "groupNumber":
        return groupNumber;
    }
  };

  const hasRejectedValue = (field: ProfileField, value: string) => {
    const rejectedValue = rejectedValues[field];

    if (rejectedValue === undefined) {
      return false;
    }

    return rejectedValue === normalizeRejectedValue(field, value);
  };

  const removeErrorToast = (id: number) => {
    const timer = toastTimersRef.current[id];

    if (timer !== undefined) {
      window.clearTimeout(timer);

      delete toastTimersRef.current[id];
    }

    setErrorToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  };

  const clearErrorToasts = () => {
    Object.values(toastTimersRef.current).forEach((timer) => {
      window.clearTimeout(timer);
    });

    toastTimersRef.current = {};

    setErrorToasts([]);
  };

  const showErrorToasts = (messages: string[]) => {
    clearErrorToasts();

    const newToasts = messages.map((message) => {
      toastIdRef.current += 1;

      return {
        id: toastIdRef.current,
        message,
      };
    });

    setErrorToasts(newToasts);

    newToasts.forEach((toast, index) => {
      const duration = 3000 + index * 1000;

      toastTimersRef.current[toast.id] = window.setTimeout(() => {
        removeErrorToast(toast.id);
      }, duration);
    });
  };

  const hideSuccessToast = () => {
    if (successToastTimerRef.current !== null) {
      window.clearTimeout(successToastTimerRef.current);

      successToastTimerRef.current = null;
    }

    setIsSuccessToastOpen(false);
  };

  const showSuccessToast = () => {
    if (successToastTimerRef.current !== null) {
      window.clearTimeout(successToastTimerRef.current);
    }

    setIsSuccessToastOpen(true);

    successToastTimerRef.current = window.setTimeout(() => {
      setIsSuccessToastOpen(false);

      successToastTimerRef.current = null;
    }, 1500);
  };

  const handleProfileError = (error: Error) => {
    const errorsToHandle: Array<{
      field: ProfileField | null;
      message: string;
    }> = [];

    if (error instanceof AuthApiError && error.fieldErrors.length > 0) {
      for (const fieldError of error.fieldErrors) {
        errorsToHandle.push({
          field: isProfileField(fieldError.field) ? fieldError.field : null,

          message: fieldError.message,
        });
      }
    } else {
      errorsToHandle.push({
        field: getFieldForMessage(error.message),

        message: error.message,
      });
    }

    setRejectedValues((currentValues) => {
      const nextValues = {
        ...currentValues,
      };

      for (const item of errorsToHandle) {
        if (item.field === null) {
          continue;
        }

        nextValues[item.field] = normalizeRejectedValue(
          item.field,
          getCurrentFieldValue(item.field),
        );
      }

      return nextValues;
    });

    showErrorToasts(
      errorsToHandle.map((item) => translateErrorMessage(item.message)),
    );
  };

  const updateProfileMutation = useMutation({
    mutationFn: updateCurrentUser,

    onSuccess: (updatedUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, updatedUser);

      setFirstName(updatedUser.firstName ?? "");

      setLastName(updatedUser.lastName ?? "");

      setUsername(updatedUser.username ?? "");

      setEmail(updatedUser.email);

      setRole(updatedUser.role);

      setGroupNumber(updatedUser.groupNumber ?? "");

      setRejectedValues({});
      clearErrorToasts();

      setIsEditing(false);

      showSuccessToast();
    },

    onError: (error) => {
      handleProfileError(error);
    },
  });

  const handleAvatarMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAvatarMenuAnchor(event.currentTarget);
  };

  const handleAvatarMenuClose = () => {
    setAvatarMenuAnchor(null);
  };

  const handleCancelEditing = () => {
    setFirstName(user.firstName ?? "");

    setLastName(user.lastName ?? "");

    setUsername(user.username ?? "");

    setEmail(user.email);

    setRole(user.role);

    setGroupNumber(user.groupNumber ?? "");

    setAvatarMenuAnchor(null);

    setRejectedValues({});
    clearErrorToasts();

    setIsEditing(false);
  };

  const handleSave = () => {
    if (!isFormValid || role === null) {
      return;
    }

    if (!hasProfileChanges) {
      setAvatarMenuAnchor(null);

      setRejectedValues({});
      clearErrorToasts();

      setIsEditing(false);

      return;
    }

    updateProfileMutation.mutate({
      firstName: firstName.trim(),

      lastName: lastName.trim(),

      username: username.trim(),

      email: email.trim(),

      role,

      groupNumber: isStudent ? groupNumber : undefined,
    });
  };

  return (
    <Box
      sx={{
        minHeight: {
          xs: "calc(100dvh - 56px)",
          md: "auto",
        },

        bgcolor: "background.default",
      }}
    >
      {/* Мобильная версия профиля */}
      <Box
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
        }}
      >
        {/* Закреплённый профиль */}
        <Box
          sx={{
            position: "sticky",

            top: 56,

            zIndex: 1000,

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
            sx={{
              width: "100%",
              maxWidth: 520,

              mx: "auto",

              alignItems: "center",
            }}
          >
            {/* Аватар */}
            <Box
              sx={{
                position: "relative",
              }}
            >
              <Avatar
                sx={{
                  width: 88,
                  height: 88,

                  bgcolor: "app.brand.navy",
                  color: "common.white",

                  fontSize: "1.75rem",
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>

              {isEditing && (
                <IconButton
                  size="small"
                  aria-label="Изменить аватар"
                  onClick={handleAvatarMenuOpen}
                  sx={{
                    position: "absolute",

                    right: -4,
                    bottom: -4,

                    width: 30,
                    height: 30,

                    bgcolor: "app.brand.navySoft",
                    color: "app.brand.navy",

                    border: "2px solid",
                    borderColor: "background.paper",

                    boxShadow: (theme) => theme.appShadows.avatar,

                    "&:hover": {
                      bgcolor: "app.brand.navySoft",
                    },
                  }}
                >
                  <EditOutlined
                    sx={{
                      fontSize: 16,
                    }}
                  />
                </IconButton>
              )}
            </Box>

            {/* ФИО + кнопки */}
            <Box
              sx={{
                position: "relative",

                width: "100%",
                minHeight: 36,
              }}
            >
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
                {firstName} {lastName}
              </Typography>

              {/* Карандаш / галка */}
              <IconButton
                size="small"
                aria-label={
                  isEditing ? "Сохранить изменения" : "Редактировать профиль"
                }
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={
                  isEditing && (!isFormValid || updateProfileMutation.isPending)
                }
                sx={{
                  position: "absolute",

                  top: -3,
                  right: 0,

                  width: 34,
                  height: 34,

                  color: isEditing
                    ? "app.status.success.text"
                    : "app.brand.navy",

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

                  "&.Mui-disabled": {
                    bgcolor: "app.background.field",
                  },
                }}
              >
                {isEditing ? (
                  updateProfileMutation.isPending ? (
                    <CircularProgress size={17} />
                  ) : (
                    <CheckRounded
                      sx={{
                        fontSize: 19,
                      }}
                    />
                  )
                ) : (
                  <EditOutlined
                    sx={{
                      fontSize: 18,
                    }}
                  />
                )}
              </IconButton>

              {/* Крестик под галкой */}
              {isEditing && (
                <IconButton
                  size="small"
                  aria-label="Отменить изменения"
                  onClick={handleCancelEditing}
                  disabled={updateProfileMutation.isPending}
                  sx={{
                    position: "absolute",

                    top: 37,
                    right: 0,

                    width: 34,
                    height: 34,

                    color: "error.main",
                    bgcolor: "app.status.error.surface",

                    border: "1px solid",
                    borderColor: "app.status.error.border",

                    boxShadow: (theme) => theme.appShadows.button,

                    "&:hover": {
                      bgcolor: "app.status.error.surface",
                    },
                  }}
                >
                  <CloseRounded
                    sx={{
                      fontSize: 19,
                    }}
                  />
                </IconButton>
              )}
            </Box>

            {/* Роль и группа */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: "center",
              }}
            >
              {roleLabel}

              {isStudent && groupNumber ? ` · ${groupNumber}` : ""}
            </Typography>
          </Stack>
        </Box>

        {/* Поля */}
        <Stack
          spacing={2}
          sx={{
            width: "100%",
            maxWidth: 520,

            mx: "auto",

            px: 2,
            py: 2,
          }}
        >
          <TextField
            label="Имя"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            error={hasRejectedValue("firstName", firstName)}
            fullWidth
            slotProps={{
              input: {
                readOnly: !isEditing,
              },
            }}
            sx={getFieldStyles(isEditing)}
          />

          <TextField
            label="Фамилия"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            error={hasRejectedValue("lastName", lastName)}
            fullWidth
            slotProps={{
              input: {
                readOnly: !isEditing,
              },
            }}
            sx={getFieldStyles(isEditing)}
          />

          <TextField
            label="Логин"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={hasRejectedValue("username", username)}
            fullWidth
            slotProps={{
              input: {
                readOnly: !isEditing,
              },
            }}
            sx={getFieldStyles(isEditing)}
          />

          <TextField
            label="Почта"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={hasRejectedValue("email", email)}
            fullWidth
            slotProps={{
              input: {
                readOnly: !isEditing,
              },
            }}
            sx={getFieldStyles(isEditing)}
          />

          {/* Роль */}
          {isEditing ? (
            <TextField
              select
              label="Роль"
              value={role ?? ""}
              error={hasRejectedValue("role", role ?? "")}
              onChange={(event) => {
                const newRole = event.target.value as UserRole;

                setRole(newRole);

                const newRoleIsStudent = newRole === "STUDENT";

                if (!newRoleIsStudent) {
                  setGroupNumber("");
                }
              }}
              fullWidth
              sx={getFieldStyles(true)}
            >
              {roleOptions.map((roleOption) => (
                <MenuItem key={roleOption} value={roleOption}>
                  {roleLabels[roleOption]}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label="Роль"
              value={roleLabel}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={getFieldStyles(false)}
            />
          )}

          {/* Группа */}
          {isStudent && (
            <>
              {isEditing ? (
                <TextField
                  select
                  label="Группа"
                  value={groupNumber}
                  error={hasRejectedValue("groupNumber", groupNumber)}
                  onChange={(event) => setGroupNumber(event.target.value)}
                  fullWidth
                  sx={getFieldStyles(true)}
                >
                  {groups.map((group) => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  label="Группа"
                  value={groupNumber}
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                  sx={getFieldStyles(false)}
                />
              )}
            </>
          )}
        </Stack>
      </Box>

      {/* Десктопная версия профиля */}
      <Box
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          width: "100%",
          maxWidth: 1120,

          mx: "auto",
        }}
      >
        {/* Заголовок страницы */}
        <Box
          sx={{
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "app.brand.navy",

              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Профиль
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.75,
            }}
          >
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
          {/* Карточка пользователя */}
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
            {/* Аватар */}
            <Box
              sx={{
                position: "relative",

                width: "fit-content",

                mx: "auto",
              }}
            >
              <Avatar
                sx={{
                  width: 112,
                  height: 112,

                  bgcolor: "app.brand.navy",
                  color: "common.white",

                  fontSize: "2rem",
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>

              {isEditing && (
                <IconButton
                  size="small"
                  aria-label="Изменить аватар"
                  onClick={handleAvatarMenuOpen}
                  sx={{
                    position: "absolute",

                    right: -4,
                    bottom: -4,

                    width: 34,
                    height: 34,

                    bgcolor: "app.brand.navySoft",
                    color: "app.brand.navy",

                    border: "2px solid",
                    borderColor: "background.paper",

                    boxShadow: (theme) => theme.appShadows.avatar,

                    "&:hover": {
                      bgcolor: "app.brand.navySoft",
                    },
                  }}
                >
                  <EditOutlined
                    sx={{
                      fontSize: 18,
                    }}
                  />
                </IconButton>
              )}
            </Box>

            {/* ФИО */}
            <Typography
              variant="h5"
              sx={{
                mt: 2.5,

                color: "app.brand.navy",

                fontWeight: 700,
                lineHeight: 1.25,

                overflowWrap: "anywhere",
              }}
            >
              {firstName} {lastName}
            </Typography>

            {/* Роль */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 1,
              }}
            >
              {roleLabel}
            </Typography>

            {/* Группа */}
            {isStudent && groupNumber && (
              <Box
                sx={{
                  width: "fit-content",

                  mx: "auto",
                  mt: 1.5,

                  px: 1.5,
                  py: 0.6,

                  bgcolor: "app.brand.navySoft",
                  color: "app.brand.navy",

                  borderRadius: 10,

                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Группа {groupNumber}
              </Box>
            )}
          </Paper>

          {/* Карточка личных данных */}
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
            {/* Заголовок карточки */}
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
                  sx={{
                    color: "app.brand.navy",

                    fontWeight: 700,
                  }}
                >
                  Личные данные
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.25,
                  }}
                >
                  Основная информация профиля
                </Typography>
              </Box>

              {/* Кнопки редактирования */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                }}
              >
                {isEditing && (
                  <IconButton
                    aria-label="Отменить изменения"
                    onClick={handleCancelEditing}
                    disabled={updateProfileMutation.isPending}
                    sx={{
                      width: 38,
                      height: 38,

                      color: "error.main",
                      bgcolor: "app.status.error.surface",

                      border: "1px solid",
                      borderColor: "app.status.error.border",

                      boxShadow: (theme) => theme.appShadows.button,

                      "&:hover": {
                        bgcolor: "app.status.error.surface",
                      },
                    }}
                  >
                    <CloseRounded
                      sx={{
                        fontSize: 21,
                      }}
                    />
                  </IconButton>
                )}

                <IconButton
                  aria-label={
                    isEditing ? "Сохранить изменения" : "Редактировать профиль"
                  }
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  disabled={
                    isEditing &&
                    (!isFormValid || updateProfileMutation.isPending)
                  }
                  sx={{
                    width: 38,
                    height: 38,

                    color: isEditing
                      ? "app.status.success.text"
                      : "app.brand.navy",

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

                    "&.Mui-disabled": {
                      bgcolor: "app.background.field",
                    },
                  }}
                >
                  {isEditing ? (
                    updateProfileMutation.isPending ? (
                      <CircularProgress size={18} />
                    ) : (
                      <CheckRounded
                        sx={{
                          fontSize: 21,
                        }}
                      />
                    )
                  ) : (
                    <EditOutlined
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  )}
                </IconButton>
              </Stack>
            </Box>

            {/* Поля профиля */}
            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",

                gap: 2.5,

                p: 3,
              }}
            >
              <TextField
                label="Имя"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                error={hasRejectedValue("firstName", firstName)}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: !isEditing,
                  },
                }}
                sx={getFieldStyles(isEditing)}
              />

              <TextField
                label="Фамилия"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                error={hasRejectedValue("lastName", lastName)}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: !isEditing,
                  },
                }}
                sx={getFieldStyles(isEditing)}
              />

              <TextField
                label="Логин"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                error={hasRejectedValue("username", username)}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: !isEditing,
                  },
                }}
                sx={getFieldStyles(isEditing)}
              />

              <TextField
                label="Почта"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={hasRejectedValue("email", email)}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: !isEditing,
                  },
                }}
                sx={getFieldStyles(isEditing)}
              />

              {/* Роль */}
              {isEditing ? (
                <TextField
                  select
                  label="Роль"
                  value={role ?? ""}
                  error={hasRejectedValue("role", role ?? "")}
                  onChange={(event) => {
                    const newRole = event.target.value as UserRole;

                    setRole(newRole);

                    const newRoleIsStudent = newRole === "STUDENT";

                    if (!newRoleIsStudent) {
                      setGroupNumber("");
                    }
                  }}
                  fullWidth
                  sx={getFieldStyles(true)}
                >
                  <MenuItem value="" disabled>
                    Выберите роль
                  </MenuItem>

                  {roleOptions.map((roleOption) => (
                    <MenuItem key={roleOption} value={roleOption}>
                      {roleLabels[roleOption]}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  label="Роль"
                  value={roleLabel}
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                  sx={getFieldStyles(false)}
                />
              )}

              {/* Группа */}
              {isStudent &&
                (isEditing ? (
                  <TextField
                    select
                    label="Группа"
                    value={groupNumber}
                    error={hasRejectedValue("groupNumber", groupNumber)}
                    onChange={(event) => setGroupNumber(event.target.value)}
                    fullWidth
                    sx={getFieldStyles(true)}
                  >
                    <MenuItem value="" disabled>
                      Выберите группу
                    </MenuItem>

                    {groups.map((group) => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    label="Группа"
                    value={groupNumber}
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                    sx={getFieldStyles(false)}
                  />
                ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Меню аватара */}
      <Menu
        anchorEl={avatarMenuAnchor}
        open={Boolean(avatarMenuAnchor)}
        onClose={handleAvatarMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleAvatarMenuClose}>
          <ListItemIcon>
            <PhotoCameraOutlined fontSize="small" />
          </ListItemIcon>

          <ListItemText>Загрузить фото</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAvatarMenuClose}>
          <ListItemIcon>
            <DeleteOutlined fontSize="small" />
          </ListItemIcon>

          <ListItemText>Удалить фото</ListItemText>
        </MenuItem>
      </Menu>

      {/* Всплывающие уведомления */}
      <Box
        sx={{
          position: "fixed",

          left: "50%",
          bottom: 16,

          zIndex: 2000,

          width: "calc(100% - 32px)",
          maxWidth: 440,

          transform: "translateX(-50%)",

          pointerEvents: "none",
        }}
      >
        <Stack spacing={1}>
          {errorToasts.map((toast) => (
            <Alert
              key={toast.id}
              severity="error"
              variant="filled"
              onClose={() => removeErrorToast(toast.id)}
              sx={{
                width: "100%",

                boxShadow: (theme) => theme.appShadows.toast,

                pointerEvents: "auto",
              }}
            >
              {toast.message}
            </Alert>
          ))}

          {isSuccessToastOpen && (
            <Alert
              severity="success"
              variant="filled"
              onClose={hideSuccessToast}
              sx={{
                width: "100%",

                boxShadow: (theme) => theme.appShadows.toast,

                pointerEvents: "auto",
              }}
            >
              Профиль успешно обновлён
            </Alert>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
