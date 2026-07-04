import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { io } from "../socket/index.js";

class MessageService {
  async sendMessage(conversationId, senderId, content, imageUrls = []) {
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
      });

      // Update the conversation's last message details
      const lastMessageObj = {
        _id: message._id.toString(),
        content: content || (imageUrls.length > 0 ? "[Hình ảnh]" : ""),
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
        { new: true }
      );

      // Populate sender information
      const populatedMessage = await Message.findById(message._id)
        .populate("senderId", "_id email username full_name profile_picture");

      // Broadcast message to all conversation participants via Socket.io
      if (updatedConversation) {
        updatedConversation.participants.forEach((participant) => {
          io.to(participant.userId.toString()).emit("newMessage", populatedMessage);
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
}

export default new MessageService();
