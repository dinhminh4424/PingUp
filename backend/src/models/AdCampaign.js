import mongoose from "mongoose";

const adCampaignSchema = new mongoose.Schema(
  {
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },
    pricingModel: {
      type: String,
      enum: ["CPC", "CPM"],
      default: "CPC",
    },
    budget: {
      total: { type: Number, required: true },
      dailyLimit: { type: Number, default: 0 },
      remaining: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "paused", "completed"],
      default: "pending",
    },
    targeting: {
      location: [{ type: String }],
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 100 },
    },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
    },
    category: {
      type: String,
      default: "Khác",
    },
    displayPlacements: {
      type: [String],
      enum: ["FEED_NATIVE", "SIDEBAR_SPONSORED"],
      default: ["FEED_NATIVE", "SIDEBAR_SPONSORED"],
    },
    
    // ctaButtons với màu sắc
    ctaButtons: [
      {
        label: { type: String, default: "Tìm hiểu thêm" },
        actionType: { type: String, enum: ["link", "lead_form"], default: "link" },
        actionUrl: { type: String, default: "" }, 
        icon: { type: String, default: "ArrowRight" },
        backgroundColor: { type: String, default: "#4f46e5" }, 
        textColor: { type: String, default: "#ffffff" },
        iconColor: { type: String, default: "#ffffff" },
      }
    ],

    // Cấu hình lead form động hỗ trợ dropdown, radio, hình ảnh banner
    leadFormConfig: {
      title: { type: String, default: "Đăng ký tư vấn / Nhận ưu đãi" },
      description: { type: String, default: "Nhập thông tin bên dưới để kết nối với chúng tôi." },
      imageUrl: { type: String, default: "" }, // Ảnh banner riêng cho form
      fields: [
        {
          label: { type: String, required: true }, 
          fieldType: { type: String, enum: ["text", "email", "tel", "textarea", "select", "radio", "file", "range"], default: "text" },
          required: { type: Boolean, default: true },
          options: [{ type: String }], // Các lựa chọn cho select/radio
          min: { type: Number, default: 0 },
          max: { type: Number, default: 100 },
          step: { type: Number, default: 1 },
        }
      ]
    },
  },
  {
    timestamps: true,
  }
);

const AdCampaign = mongoose.model("AdCampaign", adCampaignSchema);

export default AdCampaign;
