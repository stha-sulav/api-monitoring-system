import type { HydratedDocument, Model } from "mongoose";
import { model, Schema, type Types } from "mongoose";
import { APP_ENVIRONMENT } from "../../constants/shared.constant";

export interface ApiKeyPermission {
  canIngest?: boolean;
  canReadAnalytics?: boolean;
  allowedServices: string[];
}

export interface ApiKeySecurity {
  allowedIPs: string[];
  allowedOrigins: string[];
  lastRotated?: Date;
  rotationWarningDays?: number;
}

export interface ApiKeyMetadata {
  createdBy: Types.ObjectId;
  purpose: string;
  tags: string[];
}

/**
 * Plain data shape stored in MongoDB.
 * Use `ApiKeyDocument` when you need a hydrated Mongoose instance.
 */
export interface ApiKeyType {
  keyId: string;
  keyValue: string;
  clientId: Types.ObjectId;
  name: string;
  description?: string;
  environment?: APP_ENVIRONMENT;
  isActive?: boolean;
  permissions: ApiKeyPermission;
  security: ApiKeySecurity;
  expiresAt?: Date;
  metadata: ApiKeyMetadata;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKeyInstanceMethods {
  isExpired(): boolean;
}

/** Fields accepted when creating an API key; timestamps are managed by Mongoose. */
export type CreateApiKeyInput = Omit<ApiKeyType, "createdAt" | "updatedAt">;

export type ApiKeyModel = Model<ApiKeyType, object, ApiKeyInstanceMethods>;

export type ApiKeyDocument = HydratedDocument<
  ApiKeyType,
  ApiKeyInstanceMethods
>;

/**
 * MongoDB schema for API keys
 * Each API key belongs to a client and is used for authentication
 */
const apiKeySchema = new Schema<ApiKeyType, ApiKeyModel, ApiKeyInstanceMethods>(
  {
    keyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyValue: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId, // 123
      ref: "Client",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    environment: {
      type: String,
      enum: Object.values(APP_ENVIRONMENT),
      default: APP_ENVIRONMENT.PRODUCTION,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      canIngest: {
        type: Boolean,
        default: true,
      },
      canReadAnalytics: {
        type: Boolean,
        default: false,
      },
      allowedServices: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    // usage and per-key rate limiting removed
    security: {
      allowedIPs: [
        {
          type: String,
          validate: {
            validator: (v: string) =>
              /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(v) ||
              v === "0.0.0.0/0",
            message: "Invalid IP address format",
          },
        },
      ],
      allowedOrigins: [
        {
          type: String,
          validate: {
            validator: (v: string) =>
              /^https?:\/\/[^\s]+$/.test(v) || v === "*",
            message: "Invalid origin format",
          },
        },
      ],
      lastRotated: {
        type: Date,
        default: Date.now,
      },
      rotationWarningDays: {
        type: Number,
        default: 30,
      },
    },
    expiresAt: {
      type: Date,
      default: () => {
        const days = parseInt(process.env.API_KEY_EXPIRY_DAYS || "365");
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      },
      index: true,
    },
    metadata: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      purpose: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      tags: [
        {
          type: String,
          trim: true,
          maxlength: 50,
        },
      ],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "api_keys",
  },
);

apiKeySchema.index({ clientId: 1, isActive: 1 });
apiKeySchema.index({ keyValue: 1, isActive: 1 });
apiKeySchema.index({ environment: 1, clientId: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

apiKeySchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date(this.expiresAt) < new Date();
};

const ApiKey = model<ApiKeyType, ApiKeyModel>("ApiKey", apiKeySchema);

export default ApiKey;
