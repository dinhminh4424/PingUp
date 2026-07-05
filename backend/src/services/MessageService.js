import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { io } from "../socket/index.js";

class MessageService {
  async sendMessage(
    conversationId,
    senderId,
    content,
    imageUrls = [],
    files = [],
    replyTo = null,
    linkPreview = null,
  ) {
    try {
      if (!conversationId) {
        return {
          status: 400,
          data: { success: false, message: "Missing conversationId" },
        };
      }

      // Create the message
      const message = await Message.create({
        conversationId,
        senderId,
        content,
        imageUrl: imageUrls,
        files: files,
        replyTo: replyTo || undefined,
        linkPreview: linkPreview || undefined,
      });

      // Update the conversation's last message details
      const lastMessageObj = {
        _id: message._id.toString(),
        content:
          content ||
          (imageUrls.length > 0
            ? "[Hình ảnh]"
            : files.length > 0
              ? "[Tệp tin]"
              : ""),
        senderId: senderId,
        createAt: new Date(),
      };

      const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: lastMessageObj,
          lastMessageAt: new Date(),
          $addToSet: { seenBy: senderId }, // Clear read status for others by ensuring sender is in seenBy
        },
        { returnDocument: "after" },
      );

      // Populate sender and reply information
      const populatedMessage = await Message.findById(message._id)
        .populate("senderId", "_id email username full_name profile_picture")
        .populate("reactions.userId", "_id email username full_name profile_picture")
        .populate({
          path: "replyTo",
          select: "content imageUrl files senderId",
          populate: {
            path: "senderId",
            select: "_id full_name",
          },
        });

      // Broadcast message to all conversation participants via Socket.io
      if (updatedConversation) {
        updatedConversation.participants.forEach((participant) => {
          io.to(participant.userId.toString()).emit(
            "newMessage",
            populatedMessage,
          );
        });
      }

      return {
        status: 200,
        data: {
          success: true,
          message: populatedMessage,
        },
      };
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống khi gửi tin nhắn: " + error.message,
        },
      };
    }
  }

  async getMessages(conversationId, page = 1, limit = 20) {
    try {
      if (!conversationId) {
        return {
          status: 400,
          data: { success: false, message: "Missing conversationId" },
        };
      }

      const skip = (page - 1) * limit;

      // Fetch messages sorted by newest first
      const messages = await Message.find({ conversationId })
        .populate("senderId", "_id email username full_name profile_picture")
        .populate("reactions.userId", "_id email username full_name profile_picture")
        .populate({
          path: "replyTo",
          select: "content imageUrl files senderId",
          populate: {
            path: "senderId",
            select: "_id full_name",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalMessages = await Message.countDocuments({ conversationId });

      return {
        status: 200,
        data: {
          success: true,
          messages: messages, // Frontend will receive them and can sort/reverse them as needed
          currentPage: Number(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
        },
      };
    } catch (error) {
      console.error("Error fetching messages:", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống khi lấy tin nhắn: " + error.message,
        },
      };
    }
  }
  async reactToMessage(messageId, userId, emoji) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy tin nhắn" },
        };
      }

      // Check if user already reacted with this exact emoji
      const existingReactionIndex = message.reactions.findIndex(
        (r) => r.userId.toString() === userId.toString() && r.emoji === emoji,
      );

      if (existingReactionIndex !== -1) {
        // If same reaction, remove it
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // If different reaction or no reaction, remove any previous reaction by this user first
        const userPrevReactionIndex = message.reactions.findIndex(
          (r) => r.userId.toString() === userId.toString(),
        );
        if (userPrevReactionIndex !== -1) {
          message.reactions.splice(userPrevReactionIndex, 1);
        }
        // Add new reaction
        message.reactions.push({ userId, emoji });
      }

      await message.save();

      // Populate message details
      const updatedMessage = await Message.findById(messageId)
        .populate("senderId", "_id email username full_name profile_picture")
        .populate("reactions.userId", "_id email username full_name profile_picture")
        .populate({
          path: "replyTo",
          select: "content imageUrl files senderId",
          populate: {
            path: "senderId",
            select: "_id full_name",
          },
        });

      // Broadcast reaction change via Socket.io
      const updatedConversation = await Conversation.findById(
        message.conversationId,
      );
      if (updatedConversation) {
        updatedConversation.participants.forEach((participant) => {
          io.to(participant.userId.toString()).emit("messageReaction", {
            messageId,
            reactions: updatedMessage.reactions,
          });
        });
      }

      return {
        status: 200,
        data: {
          success: true,
          reactions: updatedMessage.reactions,
        },
      };
    } catch (error) {
      console.error("Error reacting to message:", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống khi bày tỏ biểu cảm: " + error.message,
        },
      };
    }
  }
}

export default new MessageService();
