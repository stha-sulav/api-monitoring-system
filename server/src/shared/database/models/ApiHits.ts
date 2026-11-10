import { model, Schema } from "mongoose";
import { HTTP_VERB } from "../../constants/security.constant";

/**
 * MongoDB schema for raw API hit events
 * Stores every individual API call
 */
const apiHitSchema = new Schema(
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

const ApiHit = model("ApiHit", apiHitSchema);

export default ApiHit;
