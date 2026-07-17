import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { io } from "../socket/index.js";
import ConversationService from "./ConversationService.js";

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

      // Get conversation participants
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return {
          status: 404,
          data: { success: false, message: "Conversation not found" },
        };
      }

      const unReadCountUpdate = {};
      conversation.participants.forEach((p) => {
        const pIdStr = p.userId.toString();
        if (pIdStr === senderId.toString()) {
          unReadCountUpdate[`unReadCount.${pIdStr}`] = 0;
        } else {
          const currentCount = conversation.unReadCount?.get(pIdStr) || 0;
          unReadCountUpdate[`unReadCount.${pIdStr}`] = currentCount + 1;
        }
      });

      const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: lastMessageObj,
          lastMessageAt: new Date(),
          seenBy: [senderId], // Reset seenBy to only contain the sender
          $set: unReadCountUpdate,
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

      // Broadcast message and updated conversation to all conversation participants via Socket.io
      if (updatedConversation) {
        // Fetch fully populated conversation
        const populatedConversation = await Conversation.findById(conversationId)
          .populate(
            "participants.userId",
            "_id email username full_name bio profile_picture cover_photo location",
          )
          .populate("seenBy")
          .populate("lastMessage.senderId");

        if (populatedConversation) {
          populatedConversation.participants.forEach((participant) => {
            const participantId = participant.userId?._id?.toString() || participant.userId?.toString();
            if (!participantId) return;

            const convObj = ConversationService.formatConversation(populatedConversation, participantId);

            // Emit updated conversation to this participant
            io.to(participantId).emit("conversationUpdated", convObj);

            // Also emit the message itself
            io.to(participantId).emit(
              "newMessage",
              populatedMessage,
            );
          });
        }
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

  async getMessages(conversationId, page = 1, limit = 20, userId = null) {
    try {
      if (!conversationId) {
        return {
          status: 400,
          data: { success: false, message: "Missing conversationId" },
        };
      }

      const skip = (page - 1) * limit;

      const filter = { conversationId };
      if (userId) {
        filter.deletedBy = { $ne: userId };
      }

      // Fetch messages sorted by newest first
      const messages = await Message.find(filter)
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

      const totalMessages = await Message.countDocuments(filter);

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
      console.error("Error getting messages:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  async deleteMessageForMe(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy tin nhắn" },
        };
      }

      if (!message.deletedBy.includes(userId)) {
        message.deletedBy.push(userId);
        await message.save();
      }

      return {
        status: 200,
        data: {
          success: true,
          message: "Xóa tin nhắn ở phía bạn thành công",
        },
      };
    } catch (error) {
      console.error("Error deleting message locally:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  async deleteChatHistory(conversationId, userId) {
    try {
      if (!conversationId || !userId) {
        return {
          status: 400,
          data: { success: false, message: "Thiếu thông tin cuộc hội thoại hoặc người dùng" },
        };
      }

      await Message.updateMany(
        { conversationId, deletedBy: { $ne: userId } },
        { $push: { deletedBy: userId } }
      );

      return {
        status: 200,
        data: {
          success: true,
          message: "Xóa lịch sử trò chuyện thành công",
        },
      };
    } catch (error) {
      console.error("Error clearing chat history:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
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

  async recallMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy tin nhắn" },
        };
      }

      if (message.senderId.toString() !== userId.toString()) {
        return {
          status: 403,
          data: { success: false, message: "Bạn không có quyền thu hồi tin nhắn này" },
        };
      }

      // Update message
      message.content = "Tin nhắn đã bị thu hồi";
      message.imageUrl = [];
      message.files = [];
      message.reactions = [];
      message.linkPreview = undefined;
      message.isRecall = true;

      await message.save();

      // Broadcast event via socket
      const conversation = await Conversation.findById(message.conversationId);
      if (conversation) {
        conversation.participants.forEach((participant) => {
          io.to(participant.userId.toString()).emit("messageRecall", {
            messageId,
            conversationId: message.conversationId,
          });
        });
      }

      return {
        status: 200,
        data: {
          success: true,
          message: "Thu hồi tin nhắn thành công",
          messageObj: message,
        },
      };
    } catch (error) {
      console.error("Error recalling message:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }
}

export default new MessageService();
