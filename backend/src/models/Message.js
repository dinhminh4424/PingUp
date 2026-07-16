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
    files: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: String }
      }
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        emoji: { type: String, required: true }
      }
    ],
    isRecall: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    linkPreview: {
      title: { type: String },
      description: { type: String },
      image: { type: String },
      url: { type: String },
      domain: { type: String },
      siteName: { type: String }
    },
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
