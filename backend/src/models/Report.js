import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    // Người  báo cáo
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Đối tượng bị báo cáo
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Thể loại báo cáo
    targetType: {
      type: String,
      enum: ["post", "comment", "message", "user", "group", "conversation"],
      required: true,
    },
    // Lý do báo cáo
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    // Chi tiết báo cáo
    details: {
      type: String,
      trim: true,
    },
    // File báo cáo
    file: [
      { type: String, trim: true },
    ],
    // Trạng thái báo cáo
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index({ createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
