import { apiFetch } from "./config";

export interface CreateSupportRequestInput {
  topic: string;
  category: string;
  description: string;
  replyEmail: string;
  attachment?: File | null;
}

export interface CreatedSupportRequest {
  id: number;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

const getErrorMessage = async (response: Response) => {
  try {
    const body: unknown = await response.json();

    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      return body.message;
    }
  } catch {
    // Ответ backend не содержит JSON.
  }

  return "Support request could not be created";
};

export const createSupportRequest = async (
  input: CreateSupportRequestInput,
): Promise<CreatedSupportRequest> => {
  const formData = new FormData();

  formData.append("topic", input.topic);
  formData.append("category", input.category);
  formData.append("description", input.description);
  formData.append("replyEmail", input.replyEmail);

  if (input.attachment) {
    formData.append("attachment", input.attachment);
  }

  const response = await apiFetch("/support-requests", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};
