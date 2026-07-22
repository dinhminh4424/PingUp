import mongoose from "mongoose";

const systemConfigHistorySchema = new mongoose.Schema(
  {
    configId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SystemConfig",
      required: true
    },
    key: {
      type: String,
      required: true,
      index: true
    },
    label: {
      type: String,
      required: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    ipAddress: {
      type: String,
      default: ""
    },
    userAgent: {
      type: String,
      default: ""
    }
  },
  { 
    timestamps: true 
  }
);

const SystemConfigHistory = mongoose.model("SystemConfigHistory", systemConfigHistorySchema);
export default SystemConfigHistory;
