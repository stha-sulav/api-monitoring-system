import * as z from "zod";
import { USER_ROLES } from "../../../shared/constants/shared.constant";

export const onboardSuperAdminSchema = z.object({
  body: z.object({
    username: z.string(),
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export const registrationSchema = z.object({
  body: z.object({
    username: z.string(),
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(Object.values(USER_ROLES)),
  }),
});

export const loginSchema = z.object({
  body: z.object({ username: z.string(), password: z.string() }),
});
