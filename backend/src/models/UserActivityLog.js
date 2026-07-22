import mongoose from "mongoose";

const userActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["POST", "COMMENT", "MESSAGE", "USER", "AUTH"],
      required: false,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    details: {
      type: mongoose.Schema.Types.Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

userActivityLogSchema.index({ userId: 1, createdAt: -1 });

const UserActivityLog = mongoose.model("UserActivityLog", userActivityLogSchema);
export default UserActivityLog;
