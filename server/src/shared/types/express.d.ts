// src/types/express.d.ts
import type { JwtPayload } from "jsonwebtoken";
import type { USER_ROLES } from "../constants/shared.constant";

export interface IUserPayload extends JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: USER_ROLES;
  clientId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}
