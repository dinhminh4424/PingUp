import mongoose from "mongoose";

const adLeadSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdCampaign",
      required: true,
    },
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Người dùng đăng ký (nếu đã đăng nhập)
      default: null,
    },
    answers: [
      {
        label: { type: String, required: true },
        value: { type: String },
        fieldType: { type: String, default: "text" },
      }
    ],
  },
  {
    timestamps: true,
  }
);

const AdLead = mongoose.model("AdLead", adLeadSchema);

export default AdLead;
