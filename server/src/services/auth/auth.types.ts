import type { HydratedDocument, Types } from "mongoose";
import type { USER_ROLES } from "../../shared/constants/shared.constant";
import type { UserType } from "../../shared/database/models/User";

/** Fields every user creation must provide. */
export interface ICredentials {
  username: string;
  email: string;
  password: string;
}

/**
 * Fields accepted when creating a document.
 * Credentials stay required; server-managed timestamps and everything else are optional.
 */
export type CreateDTO<T extends ICredentials> = Partial<
  Omit<T, "createdAt" | "updatedAt">
> &
  Pick<T, keyof ICredentials>;

/** Safe shape returned to clients: the user without the password field. */
export type UserResponse = Omit<UserType, "password"> & { _id: Types.ObjectId };

export interface IBaseAuthRepository<T extends ICredentials> {
  create(data: CreateDTO<T>): Promise<HydratedDocument<T>>;
  findById(id: string): Promise<HydratedDocument<T> | null>;
  findByUsername(username: string): Promise<HydratedDocument<T> | null>;
  findByEmail(email: string): Promise<HydratedDocument<T> | null>;
  findAll(): Promise<HydratedDocument<T>[]>;
}

/** JWT payload before serialisation; ids become strings after `jwt.sign`. */
export interface JwtPayload {
  userId: Types.ObjectId;
  email: string;
  username: string;
  role: USER_ROLES;
  clientId?: Types.ObjectId;
}
