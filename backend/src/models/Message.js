import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    imageUrl: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// sắp xép theo conversationId, và createdAt
// conversationId tăng dần, createdAt giảm dần
// => sẽ có các tin nhắn cùng hộp thoại gom lại với nhau (1 cụm conversationId:1, 1 cụm conversationId:2, 1 cụm conversationId:3, ... )
// và sắp xép theo tin nhắn được tạo mới nhất lên trước
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
