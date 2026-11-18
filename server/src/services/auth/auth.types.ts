import type { Document, HydratedDocument, Schema, Types } from "mongoose";
import type { USER_ROLES } from "../../shared/constants/shared.constant";

// T extends a Mongoose Document, so drop the Document members (save, $assertPopulated, ...)
// that cannot be supplied when creating. Credentials stay required; the rest is optional.
export interface ICredentials {
  username: string;
  email: string;
  password: string;
}

export type CreateDTO<T extends ICredentials> = Partial<
  Omit<T, keyof Document>
> &
  Pick<T, keyof ICredentials>;

export interface IBaseAuthRepository<T extends ICredentials> {
  create(data: CreateDTO<T>): Promise<HydratedDocument<T>>;
  findById(id: string): Promise<T | null>;
  findByUsername(username: string): Promise<T | null>;
  findByEmail(email: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  // update?(id: string, data: Partial<T>): Promise<T | null>;
  // delete?(id: string): Promise<boolean>;
}

export interface jwtPayload {
  userId: Types.ObjectId;
  email: string;
  username: string;
  role: USER_ROLES;
  clientId: Schema.Types.ObjectId;
}
