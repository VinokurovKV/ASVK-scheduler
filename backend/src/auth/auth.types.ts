export type UserRole =
  'STUDENT' | 'POSTGRADUATE' | 'EMPLOYEE';

export interface RegisterInput {
  firstName: string;
  lastName: string;

  username: string;
  email: string;

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

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;

  username: string;
  email: string;

  role: UserRole;
  groupNumber?: string;
}
