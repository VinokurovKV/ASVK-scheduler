import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  sessionToken: string;
  user: {
    id: number;
  };
}
