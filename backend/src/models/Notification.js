import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Người nhận thông báo
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Người tạo ra thông báo
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Nội dung hiển thị
    content: {
      type: String,
      trim: true,
      required: true,
    },

    // Ảnh minh họa (avatar, ảnh bài viết...)
    image_urls: [
      {
        type: String,
        trim: true,
      },
    ],

    // Loại thông báo
    type: {
      type: String,
      enum: [
        "message",
        "like_post",
        "comment_post",
        "reply_comment",
        "share_post",
        "friend_request",
        "friend_accept",
        "mention",
        "system",
      ],
      required: true,
    },

    // Id đối tượng liên quan (post, conversation...)
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Collection của referenceId
    referenceModel: {
      type: String,
      enum: ["Post", "Conversation", "Comment", "User", ""],
      default: "",
    },

    // Đã đọc chưa
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ receiver: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

// VÍ DỤ 1: Thông báo tin nhắn

// {
//   "receiver": "receiverId",
//   "sender": "senderId",
//   "type": "message",
//   "content": "Nguyễn Văn A đã gửi cho bạn một tin nhắn.",
//   "referenceId": "conversationId",
//   "referenceModel": "Conversation",
//   "isRead": false
// }

// VÍ DỤ 2: Thông báo thích bài viết

// {
//   "receiver": "ownerPostId",
//   "sender": "userLikeId",
//   "type": "like_post",
//   "content": "Nguyễn Văn A đã thích bài viết của bạn.",
//   "referenceId": "postId",
//   "referenceModel": "Post",
//   "isRead": false
// }

export default Notification;
