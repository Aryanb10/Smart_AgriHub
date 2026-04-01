import type { User } from "@shared/models/auth";

declare global {
  namespace Express {
    interface User {
      claims?: {
        sub?: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string | null;
      };
      expires_at?: number;
      access_token?: string;
      refresh_token?: string;
    }

    interface Request {
      file?: {
        filename: string;
        path: string;
        originalname: string;
      };
      user?: User & Express.User;
    }
  }
}

export {};
