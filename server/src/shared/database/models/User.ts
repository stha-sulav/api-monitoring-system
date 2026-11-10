import { model, Schema } from "mongoose";
import SecurityUtils from "../../utils/security.utils";
import { USER_ROLES } from "../../constants/security.constant";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
      validate: {
        validator: function (userName) {
          return /^[a-zA-Z0-9_-]+$/.test(userName);
        },
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
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      validate: {
        validator: function (password: string) {
          if (this.isModified && password) {
            const validation = SecurityUtils.validatePassword(password);
            return validation.success;
          }
          return true;
        },
        message: function (props: any) {
          const password = props.value;
          if (password) {
            const validation = SecurityUtils.validatePassword(password);
            return validation.errors.join(". ");
          }
          return "Validation Failed";
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
      required: function () {
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

const User = model("User", userSchema);
export default User;
