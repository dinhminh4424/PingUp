import Feedback from "../../models/Feedback.js";

import User from "../../models/User.js";

class FeedbackService {
  // Get conversations list with pagination and search
  async getFeedbacks(
    searchQuery,
    rankFilter,
    categoryFilter,
    startDate,
    endDate,
    page = 1,
  ) {
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
        .populate(
          "participants.userId",
          "_id username full_name profile_picture",
        )
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

      const totalConversations = await Conversation.countDocuments({
        isDelete: false,
      });
      const directConversations = await Conversation.countDocuments({
        isDelete: false,
        type: "direct",
      });
      const groupConversations = await Conversation.countDocuments({
        isDelete: false,
        type: "group",
      });
      const deletedConversations = await Conversation.countDocuments({
        isDelete: true,
      });
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
}

export default new FeedbackService();
