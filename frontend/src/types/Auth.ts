export type AuthProvider = "STANDARD" | "ASVK";
export type AppRole = "GROUP_LEADER" | "OWNER";
export type AvatarColor =
  | "BLUE"
  | "SKY"
  | "TURQUOISE"
  | "MAGENTA"
  | "VIOLET"
  | "PINK"
  | "BURGUNDY"
  | "RED"
  | "ORANGE"
  | "YELLOW"
  | "LIME"
  | "GREEN";

export type UserRole = "STUDENT" | "POSTGRADUATE" | "EMPLOYEE";

export interface AuthUser {
  id: number;

  name: string;
  firstName: string | null;
  lastName: string | null;

  username: string | null;
  email: string;

  role: UserRole | null;
  groupNumber: string | null;
  appRoles: AppRole[];
  avatarColor: AvatarColor;

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
  avatarColor?: AvatarColor;
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
