import mongoose from "mongoose";

const participantSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
  },
  { _id: false }, // cho biết participantSchema này ko phải là 1 bảng riêng chỉ là 1 schema phụ nên ko cần id
);

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    imageGroup: {
      type: String,
      default:"",
    },
    createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false },
);

const messageSchema = mongoose.Schema(
  {
    _id: { type: String },
    content: { type: String },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createAt: {
      type: Date,
    },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["group", "direct"],
      required: true,
    },
    participants: {
      type: [participantSchema],
      required: true,
    },
    group: {
      type: groupSchema,
      required: false,
    },
    lastMessageAt: {
      type: Date,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: { type: messageSchema, default: null },
    unReadCount: {
      type: Map, // là {key, value} á { idUser, 9} , { idUser, 0}
      of: Number,
      default: {},
    },
    theme: {
      type: { type: String, enum: ["color", "image"], default: "color" },
      value: { type: String, default: "#eef0f3" }
    },
    quickEmoji: {
      type: String,
      default: "👍"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDelete: {
      type: Boolean,
      default: false
    },
    isDisband: {
      type: Boolean,
      default: false
    },
    joinRequests: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

// gom nhóm participants theo userId tăng dần,
// và sắp xếp theo lastMessageAt giảm dần
// => coá nghĩa là lấy ra các tin nhắn mới nhất của từng người
conversationSchema.index({ "participants.userId": 1, lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
