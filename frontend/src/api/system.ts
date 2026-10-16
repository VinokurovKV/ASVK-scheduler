import type { AppRole, AuthProvider, UserRole } from "../types/Auth";
import { apiFetch } from "./config";

export const SYSTEM_USERS_QUERY_KEY = ["system", "users"] as const;

export interface SystemUser {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string;
  role: UserRole | null;
  groupNumber: string | null;
  appRoles: AppRole[];
  authProvider: AuthProvider;
  _count: {
    sessions: number;
  };
}

export const getSystemUsers = async (): Promise<SystemUser[]> => {
  const response = await apiFetch("/system/users");

  if (!response.ok) {
    throw new Error("Failed to load system users");
  }

  return response.json();
};

export const updateSystemUserRoles = async (
  userId: number,
  appRoles: AppRole[],
): Promise<{ id: number; appRoles: AppRole[] }> => {
  const response = await apiFetch(`/system/users/${userId}/app-roles`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appRoles }),
  });

  if (!response.ok) {
    throw new Error("Failed to update user roles");
  }

  return response.json();
};
