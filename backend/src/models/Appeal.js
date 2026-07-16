import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // Người  báo cáo
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Đối tượng  kháng cáo
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Thể loại kháng cáo
    targetType: {
      type: String,
      enum: ["post", "comment", "message", "user"],
      required: true,
    },
    // Lý do kháng báo cáo
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    // Chi tiết kháng báo cáo
    details: {
      type: String,
      trim: true,
    },
    // File báo cáo
    file: [{ type: String, trim: true }],
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

commentSchema.index({ post: 1, parentComment: 1, createdAt: -1 });
commentSchema.index({ post: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ user: 1 });
commentSchema.index({ mentions: 1 });

commentSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
