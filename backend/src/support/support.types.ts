export interface CreateSupportRequestInput {
  topic: string;
  category: string;
  description: string;
  replyEmail: string;
}

export interface SupportAttachmentInput {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}
