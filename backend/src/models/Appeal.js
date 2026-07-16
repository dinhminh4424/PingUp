import mongoose from "mongoose";

const appealSchema = new mongoose.Schema(
  {
    // Người kháng cáo
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ID đối tượng bị xử lý kỷ luật (ID bài đăng, bình luận, tin nhắn, v.v.)
    targetId: {
      type: String,
      required: true,
    },
    // Phân loại thực thể của targetId để biết ID đó thuộc về đối tượng nào
    targetModel: {
      type: String,
      enum: ["Post", "Comment", "Conversation", "User", "Story"],
      required: true,
    },
    // Thể loại kháng cáo
    appealType: {
      type: String,
      enum: [
        "Post Removal Appeal",
        "Comment Removal Appeal",
        "Chat/Message Restriction Appeal",
        "Account Warning / Strike",
        "Account Suspension / Temporary Lock",
        "Nudity & Sexual Content Strike Appeal",
        "Hate Speech & Harassment Appeal",
        "Spam / False Positive Appeal",
        "Intellectual Property / Copyright Appeal",
        "Other Moderation Action"
      ],
      required: true,
    },
    // Lý do người dùng muốn rút lại quyết định
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    // Chi tiết bổ sung từ người dùng
    details: {
      type: String,
      trim: true,
    },
    // Hình ảnh hoặc file minh chứng đính kèm
    media: [
      {
        type: String,
        trim: true,
      },
    ],
    // Trạng thái kháng cáo
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Resolved", "Rejected"],
      default: "Pending",
    },
    // Người xử lý khiếu nại (Admin)
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Ngày xử lý khiếu nại
    resolvedAt: {
      type: Date,
    },
    // Ghi chú của Admin khi xử lý kháng cáo
    resolutionNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

appealSchema.index({ createdAt: -1 });
appealSchema.index({ user: 1 });

const Appeal = mongoose.model("Appeal", appealSchema);

export default Appeal;
