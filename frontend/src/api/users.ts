import type { AuthProvider, AvatarColor, UserRole } from "../types/Auth";
import { apiFetch } from "./config";

export const USERS_QUERY_KEY = ["users"] as const;

export interface PublicUser {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  role: UserRole | null;
  groupNumber: string | null;
  avatarColor: AvatarColor;
  authProvider: AuthProvider;
}

export const getUsers = async (): Promise<PublicUser[]> => {
  const response = await apiFetch("/users");

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return response.json();
};
