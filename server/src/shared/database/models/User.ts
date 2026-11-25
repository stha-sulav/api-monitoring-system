import bcrypt from "bcryptjs";
import type { HydratedDocument } from "mongoose";
import { model, Schema, type Types, type ValidatorProps } from "mongoose";
import { USER_ROLES } from "../../constants/shared.constant";
import SecurityUtils from "../../utils/security.utils";

export interface UserPermissionType {
  canCreateApiKeys: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

/**
 * Plain data shape stored in MongoDB.
 * Use `UserDocument` when you need a hydrated Mongoose instance.
 */
export interface UserType {
  username: string;
  email: string;
  password: string;
  role: USER_ROLES;
  clientId?: Types.ObjectId;
  isActive: boolean;
  permissions: UserPermissionType;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<UserType>;

const userSchema = new Schema<UserType>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
      validate: {
        validator: (userName) => /^[a-zA-Z0-9_-]+$/.test(userName),
        message: "Please enter a valid username",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      validate: {
        validator: (password: string) => {
          return SecurityUtils.validatePassword(password).success;
        },
        message: (props: ValidatorProps) => {
          const validation = SecurityUtils.validatePassword(props.value);
          return validation.errors.join(". ");
        },
      },
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CLINET_VIWER,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: function (): boolean {
        return this.role !== USER_ROLES.SUPER_ADMIN;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      canCreateApiKeys: {
        type: Boolean,
        default: false,
      },
      canManageUsers: {
        type: Boolean,
        default: false,
      },
      canViewAnalytics: {
        type: Boolean,
        default: true,
      },
      canExportData: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    collection: "users",
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as Partial<UserType>).password;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.index({ clientId: 1, isActive: 1 });
userSchema.index({ role: 1 });

const User = model<UserType>("User", userSchema);
export default User;
