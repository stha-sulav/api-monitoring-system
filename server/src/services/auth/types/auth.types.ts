import { HydratedDocument, ObjectId, Schema, Types } from "mongoose";
import { USER_ROLES } from "../../../shared/constants/shared.constant";

export type CreateDTO<T> = Omit<T, "id">;

export interface IBaseAuthRepository<T> {
  create(data: CreateDTO<T>): Promise<HydratedDocument<T>>;
  findById(id: ObjectId): Promise<T | null>;
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
