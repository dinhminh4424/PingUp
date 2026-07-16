import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import User from "../../models/User.js";

class MessageService {
  // Get conversations list with pagination and search
  async getConversations(searchQuery, statusFilter, startDate, endDate, page = 1) {
    try {
      const limit = 10;
      const pageNumber = Math.max(1, parseInt(page) || 1);
      const skip = (pageNumber - 1) * limit;

      let search = {};

      if (searchQuery) {
        // Search group name
        const matchedUsers = await User.find({
          $or: [
            { full_name: { $regex: searchQuery, $options: "i" } },
            { username: { $regex: searchQuery, $options: "i" } },
          ],
        }).select("_id");
        const userIds = matchedUsers.map((u) => u._id);

        search.$or = [
          { "group.name": { $regex: searchQuery, $options: "i" } },
          { "participants.userId": { $in: userIds } },
        ];
      }

      // Filter by status
      if (statusFilter === "deleted") {
        search.isDelete = true;
      } else {
        search.isDelete = false;
        if (statusFilter === "active") {
          search.isActive = { $ne: false };
        } else if (statusFilter === "blocked") {
          search.isActive = false;
        }
      }

      // Filter by date range
      if (startDate || endDate) {
        search.createdAt = {};
        if (startDate) {
          search.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          search.createdAt.$lte = end;
        }
      }

      const conversations = await Conversation.find(search)
        .populate("participants.userId", "_id username full_name profile_picture")
        .populate("group.createBy", "_id username full_name")
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalFiltered = await Conversation.countDocuments(search);

      // Add message count to each conversation for admin info
      const conversationsWithCount = await Promise.all(
        conversations.map(async (conv) => {
          const messageCount = await Message.countDocuments({
            conversationId: conv._id,
          });
          return {
            ...conv.toObject(),
            message_count: messageCount,
          };
        }),
      );

      const totalConversations = await Conversation.countDocuments({ isDelete: false });
      const directConversations = await Conversation.countDocuments({ isDelete: false, type: "direct" });
      const groupConversations = await Conversation.countDocuments({ isDelete: false, type: "group" });
      const deletedConversations = await Conversation.countDocuments({ isDelete: true });
      const totalMessages = await Message.countDocuments({});

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách hội thoại thành công!",
          conversations: conversationsWithCount,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalFiltered / limit),
            totalConversations: totalFiltered,
            limit,
          },
          stats: {
            totalConversations,
            directConversations,
            groupConversations,
            deletedConversations,
            totalMessages,
          },
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy danh sách hội thoại admin: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  // Get messages inside a conversation
  async getConversationMessages(conversationId, page = 1) {
    try {
      const limit = 30;
      const skip = (page - 1) * limit;

      const messages = await Message.find({ conversationId })
        .populate("senderId", "_id username full_name profile_picture")
        .populate("reactions.userId", "_id username full_name profile_picture")
        .populate({
          path: "replyTo",
          populate: {
            path: "senderId",
            select: "_id username full_name profile_picture",
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
          message: "Lấy tin nhắn thành công!",
          messages,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages,
            limit,
          },
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy tin nhắn admin: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const result = await Message.findByIdAndDelete(messageId);
      if (!result) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy tin nhắn cần xóa" },
        };
      }
      return {
        status: 200,
        data: {
          success: true,
          message: "Xóa tin nhắn thành công!",
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống xóa tin nhắn: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  // Delete conversation
  async deleteConversation(conversationId) {
    try {
      const result = await Conversation.findByIdAndDelete(conversationId);
      if (!result) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy hộp thoại cần xóa" },
        };
      }
      // Delete all messages in this conversation
      await Message.deleteMany({ conversationId });
      
      return {
        status: 200,
        data: {
          success: true,
          message: "Xóa cuộc hội thoại và toàn bộ tin nhắn thành công!",
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống xóa hội thoại: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  // Toggle active status of a conversation
  async toggleActive(conversationId) {
    try {
      const conv = await Conversation.findById(conversationId);
      if (!conv) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy cuộc trò chuyện" },
        };
      }
      conv.isActive = conv.isActive === undefined ? false : !conv.isActive;
      await conv.save();

      return {
        status: 200,
        data: {
          success: true,
          message: `Đã ${conv.isActive ? "kích hoạt" : "vô hiệu hóa"} cuộc trò chuyện thành công`,
          conversation: conv,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống thay đổi trạng thái hoạt động của hộp thoại: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  // Toggle delete status of a conversation
  async toggleDelete(conversationId) {
    try {
      const conv = await Conversation.findById(conversationId);
      if (!conv) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy cuộc trò chuyện" },
        };
      }
      conv.isDelete = conv.isDelete === undefined ? true : !conv.isDelete;
      await conv.save();

      return {
        status: 200,
        data: {
          success: true,
          message: `Đã ${conv.isDelete ? "xóa" : "khôi phục"} cuộc trò chuyện thành công`,
          conversation: conv,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống thay đổi trạng thái xóa của hộp thoại: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }
}

export default new MessageService();
