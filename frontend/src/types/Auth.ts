export type AuthProvider = "STANDARD" | "ASVK";

export type UserRole =
  | "STUDENT"
  | "POSTGRADUATE"
  | "EMPLOYEE";

export interface AuthUser {
  id: number;

  name: string;
  firstName: string | null;
  lastName: string | null;

  username: string | null;
  email: string;

  role: UserRole | null;
  groupNumber: string | null;

  authProvider: AuthProvider;

  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;

  email: string;
  username: string;

  role: UserRole;
  groupNumber?: string;

  password: string;

  rememberMe?: boolean;
}

export interface LoginInput {
  login: string;
  password: string;

  rememberMe?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;

  username: string;
  email: string;

  role: UserRole;
  groupNumber?: string;
}

export type SessionDeviceType = "PHONE" | "LAPTOP" | "DESKTOP";

export interface AuthSessionInfo {
  id: number;
  deviceType: SessionDeviceType;
  deviceName: string;
  current: boolean;
  online: boolean;
  lastActiveAt: string;
  createdAt: string;
}
