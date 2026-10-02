import type { AuthUser, LoginInput, RegisterInput } from "../types/Auth";

const API_URL = "http://localhost:3000";

const getErrorMessage = async (response: Response) => {
  try {
    const body = await response.json();

    if (typeof body.message === "string") {
      return body.message;
    }

    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }
  } catch {
    // Ответ без JSOzs
  }

  return "Произошла ошибка";
};

export const register = async (input: RegisterInput): Promise<AuthUser> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const login = async (input: LoginInput): Promise<AuthUser> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
};
