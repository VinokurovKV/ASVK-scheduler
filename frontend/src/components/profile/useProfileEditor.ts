import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { AuthApiError, updateCurrentUser } from "../../api/auth";
import { AUTH_QUERY_KEY } from "../../api/authQuery";
import type { AuthUser } from "../../types/Auth";
import {
  type ProfileErrorToast,
  type ProfileField,
  type ProfileFormValues,
  type ProfileValueChangeHandler,
  roleLabels,
} from "./profileTypes";

type RejectedValues = Partial<Record<ProfileField, string>>;

const isProfileField = (value: string): value is ProfileField =>
  [
    "firstName",
    "lastName",
    "username",
    "email",
    "role",
    "groupNumber",
  ].includes(value);

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

const getInitialValues = (user: AuthUser): ProfileFormValues => ({
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  username: user.username ?? "",
  email: user.email,
  role: user.role,
  groupNumber: user.groupNumber ?? "",
  avatarColor: user.avatarColor,
});

export const useProfileEditor = (user: AuthUser) => {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ProfileFormValues>(() =>
    getInitialValues(user),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [rejectedValues, setRejectedValues] = useState<RejectedValues>({});
  const [errorToasts, setErrorToasts] = useState<ProfileErrorToast[]>([]);
  const [isSuccessToastOpen, setIsSuccessToastOpen] = useState(false);
  const successToastTimerRef = useRef<number | null>(null);
  const toastIdRef = useRef(0);
  const toastTimersRef = useRef<Record<number, number>>({});

  const isStudent = values.role === "STUDENT";
  const initials =
    `${values.firstName[0] ?? ""}${values.lastName[0] ?? ""}`.toUpperCase();
  const roleLabel =
    values.role !== null ? roleLabels[values.role] : "Пользователь";
  const isFormValid =
    values.firstName.trim().length > 0 &&
    values.lastName.trim().length > 0 &&
    values.username.trim().length >= 3 &&
    values.email.trim().length > 0 &&
    values.role !== null &&
    (!isStudent || values.groupNumber.length > 0);
  const hasProfileChanges =
    values.firstName.trim() !== (user.firstName ?? "").trim() ||
    values.lastName.trim() !== (user.lastName ?? "").trim() ||
    values.username.trim() !== (user.username ?? "").trim() ||
    values.email.trim() !== user.email.trim() ||
    values.role !== user.role ||
    values.avatarColor !== user.avatarColor ||
    (isStudent
      ? values.groupNumber !== (user.groupNumber ?? "")
      : user.groupNumber !== null && user.groupNumber !== undefined);

  const normalizeRejectedValue = (field: ProfileField, value: string) => {
    const trimmedValue = value.trim();
    return field === "username" || field === "email"
      ? trimmedValue.toLowerCase()
      : trimmedValue;
  };

  const getCurrentFieldValue = (field: ProfileField) =>
    values[field] ?? "";

  const hasRejectedValue = (field: ProfileField, value: string) => {
    const rejectedValue = rejectedValues[field];
    return (
      rejectedValue !== undefined &&
      rejectedValue === normalizeRejectedValue(field, value)
    );
  };

  const removeErrorToast = (id: number) => {
    const timer = toastTimersRef.current[id];
    if (timer !== undefined) {
      window.clearTimeout(timer);
      delete toastTimersRef.current[id];
    }
    setErrorToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const clearErrorToasts = () => {
    Object.values(toastTimersRef.current).forEach(window.clearTimeout);
    toastTimersRef.current = {};
    setErrorToasts([]);
  };

  const showErrorToasts = (messages: string[]) => {
    clearErrorToasts();
    const nextToasts = messages.map((message) => ({
      id: ++toastIdRef.current,
      message,
    }));
    setErrorToasts(nextToasts);
    nextToasts.forEach((toast, index) => {
      toastTimersRef.current[toast.id] = window.setTimeout(
        () => removeErrorToast(toast.id),
        3000 + index * 1000,
      );
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
    const errors: Array<{ field: ProfileField | null; message: string }> = [];
    if (error instanceof AuthApiError && error.fieldErrors.length > 0) {
      error.fieldErrors.forEach((fieldError) => {
        errors.push({
          field: isProfileField(fieldError.field) ? fieldError.field : null,
          message: fieldError.message,
        });
      });
    } else {
      errors.push({
        field: getFieldForMessage(error.message),
        message: error.message,
      });
    }

    setRejectedValues((current) => {
      const next = { ...current };
      errors.forEach(({ field }) => {
        if (field !== null) {
          next[field] = normalizeRejectedValue(
            field,
            String(getCurrentFieldValue(field)),
          );
        }
      });
      return next;
    });
    showErrorToasts(errors.map(({ message }) => translateErrorMessage(message)));
  };

  const updateProfileMutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, updatedUser);
      setValues(getInitialValues(updatedUser));
      setRejectedValues({});
      clearErrorToasts();
      setIsEditing(false);
      showSuccessToast();
    },
    onError: handleProfileError,
  });

  const setValue: ProfileValueChangeHandler = (field, value) => {
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "role" && value !== "STUDENT") {
        next.groupNumber = "";
      }
      return next;
    });
  };

  const cancelEditing = () => {
    setValues(getInitialValues(user));
    setAvatarMenuAnchor(null);
    setRejectedValues({});
    clearErrorToasts();
    setIsEditing(false);
  };

  const save = () => {
    if (!isFormValid || values.role === null) {
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
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      role: values.role,
      groupNumber: isStudent ? values.groupNumber : undefined,
      avatarColor: values.avatarColor,
    });
  };

  return {
    values,
    initials,
    roleLabel,
    isStudent,
    isEditing,
    isFormValid,
    isPending: updateProfileMutation.isPending,
    avatarMenuAnchor,
    errorToasts,
    isSuccessToastOpen,
    setValue,
    hasRejectedValue,
    startEditing: () => setIsEditing(true),
    cancelEditing,
    save,
    openAvatarMenu: (anchor: HTMLElement) => setAvatarMenuAnchor(anchor),
    closeAvatarMenu: () => setAvatarMenuAnchor(null),
    removeErrorToast,
    hideSuccessToast,
  };
};
