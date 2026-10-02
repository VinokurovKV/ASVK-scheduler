export type AuthProvider = "STANDARD" | "ASVK";

export type UserRole =
  | "BACHELOR_STUDENT"
  | "MASTER_STUDENT"
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
