import mongoose from "mongoose";

const adLogSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdCampaign",
      required: true,
    },
    placement: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: ["impression", "click"],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // nullable nếu user chưa login hoặc là khách vãng lai
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

// Tạo index để tối ưu hóa việc truy vấn thống kê báo cáo
adLogSchema.index({ campaign: 1, eventType: 1, createdAt: 1 });

const AdLog = mongoose.model("AdLog", adLogSchema);

export default AdLog;
