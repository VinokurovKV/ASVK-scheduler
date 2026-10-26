import type { AuthUser } from "../../types/Auth";

export type UserRole = NonNullable<AuthUser["role"]>;

export type ProfileField =
  | "firstName"
  | "lastName"
  | "username"
  | "email"
  | "role"
  | "groupNumber"
  | "avatarColor";

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole | null;
  groupNumber: string;
  avatarColor: AuthUser["avatarColor"];
}

export type ProfileValueChangeHandler = <Field extends ProfileField>(
  field: Field,
  value: ProfileFormValues[Field],
) => void;

export interface ProfileErrorToast {
  id: number;
  message: string;
}

export const roleLabels: Record<UserRole, string> = {
  STUDENT: "Студент",
  POSTGRADUATE: "Аспирант",
  EMPLOYEE: "Сотрудник",
};

export const roleOptions: UserRole[] = [
  "STUDENT",
  "POSTGRADUATE",
  "EMPLOYEE",
];

export const studentGroups = ["321", "421", "521", "621"];
