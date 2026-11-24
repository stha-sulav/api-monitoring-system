import type { HydratedDocument } from "mongoose";
import { model, Schema, type Types } from "mongoose";
import { HTTP_VERB } from "../../constants/shared.constant";

/**
 * Plain data shape stored in MongoDB.
 * Use `ApiHitDocument` when you need a hydrated Mongoose instance.
 */
export interface ApiHitType {
  eventId: string;
  timestamp: Date;
  serviceName: string;
  endpoint: string;
  /** Stored values are the enum member names, e.g. "GET", not the numeric values. */
  method: keyof typeof HTTP_VERB;
  statusCode: number;
  latencyMs: number;
  clientId: Types.ObjectId;
  apiKeyId: Types.ObjectId;
  ip: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ApiHitDocument = HydratedDocument<ApiHitType>;

/**
 * MongoDB schema for raw API hit events
 * Stores every individual API call
 */
const apiHitSchema = new Schema<ApiHitType>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: Object.values(HTTP_VERB),
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    latencyMs: {
      type: Number,
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    apiKeyId: {
      type: Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
      index: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "api_hits",
  },
);

// Create compound indexes for common queries
apiHitSchema.index({ clientId: 1, serviceName: 1, endpoint: 1, timestamp: -1 });
apiHitSchema.index({ clientId: 1, timestamp: -1, statusCode: 1 });
apiHitSchema.index({ apiKeyId: 1, timestamp: -1 });
apiHitSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const ApiHit = model<ApiHitType>("ApiHit", apiHitSchema);

export default ApiHit;
