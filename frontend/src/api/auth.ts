import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "../types/Auth";

const API_URL = "http://localhost:3000";

export interface AuthFieldError {
  field: string;
  message: string;
}

export class AuthApiError extends Error {
  status: number;
  fieldErrors: AuthFieldError[];

  constructor(
    message: string,
    status: number,
    fieldErrors: AuthFieldError[] = [],
  ) {
    super(message);

    this.name = "AuthApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const getApiError = async (response: Response): Promise<AuthApiError> => {
  let message = "Произошла ошибка";
  let fieldErrors: AuthFieldError[] = [];

  try {
    const body: unknown = await response.json();

    if (typeof body === "object" && body !== null) {
      const responseBody = body as {
        message?: unknown;
        errors?: unknown;
      };

      if (typeof responseBody.message === "string") {
        message = responseBody.message;
      } else if (Array.isArray(responseBody.message)) {
        message = responseBody.message
          .filter((item): item is string => typeof item === "string")
          .join(", ");
      }

      if (Array.isArray(responseBody.errors)) {
        fieldErrors = responseBody.errors.flatMap((error) => {
          if (typeof error !== "object" || error === null) {
            return [];
          }

          const fieldError = error as {
            field?: unknown;
            message?: unknown;
          };

          if (
            typeof fieldError.field !== "string" ||
            typeof fieldError.message !== "string"
          ) {
            return [];
          }

          return [
            {
              field: fieldError.field,
              message: fieldError.message,
            },
          ];
        });
      }
    }
  } catch {
    // Ответ backend не содержит JSON.
  }

  return new AuthApiError(message, response.status, fieldErrors);
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
    throw await getApiError(response);
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
    throw await getApiError(response);
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
    throw await getApiError(response);
  }

  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw await getApiError(response);
  }
};

export const updateCurrentUser = async (
  input: UpdateProfileInput,
): Promise<AuthUser> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  return response.json();
};
