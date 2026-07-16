import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    // Người gửi phản hồi
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Thể loại phản hồi
    category: {
      type: String,
      enum: ["suggestion", "bug", "compliment", "other"],
      required: true,
    },
    // Điểm đánh giá (1 đến 5 sao)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Nội dung góp ý / phản hồi
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    // Trạng thái xử lý phản hồi
    status: {
      type: String,
      enum: ["New", "Reviewed", "Archived"],
      default: "New",
    },
    // Hình ảnh hoặc video đính kèm
    media: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
