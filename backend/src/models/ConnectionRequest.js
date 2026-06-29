import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
  {
    sender: {
      // Người gửi
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      // Người nhận
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Không cho phép tạo nhiều request giữa cùng 2 người
connectionRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model("ConnectionRequest", connectionRequestSchema);
