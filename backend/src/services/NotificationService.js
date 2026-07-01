import Notification from "../models/Notification.js";

class NotificationService {
  async createNotification({
    receiver,
    sender,
    content,
    type,
    referenceId = null,
    link = "",
    image_urls = [],
  }) {
    try {
      // Tránh việc gửi thông báo cho chính mình (ngoại trừ loại system)
      if (type !== "system" && sender && receiver && sender.toString() === receiver.toString()) {
        return { success: false, message: "Cannot send notification to yourself" };
      }

      const notification = await Notification.create({
        receiver,
        sender,
        content,
        type,
        referenceId,
        link,
        image_urls,
      });

      // Ở đây có thể tích hợp Socket.IO emit thông báo realtime sau này

      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error("Lỗi khi tạo thông báo:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getNotifications(userId, page = 1, limit = 10, tab = "all", unreadOnly = false) {
    try {
      const query = { receiver: userId };

      if (unreadOnly === true || unreadOnly === "true") {
        query.isRead = false;
      }

      if (tab === "message") {
        query.type = "message";
      } else if (tab === "interaction") {
        query.type = { $in: ["like_post", "comment_post", "reply_comment"] };
      } else if (tab === "friend") {
        query.type = { $in: ["friend_request", "friend_accept"] };
      } else if (tab === "system") {
        query.type = "system";
      }

      const skip = (page - 1) * limit;
      const total = await Notification.countDocuments(query);
      const notifications = await Notification.find(query)
        .populate("sender", "_id username full_name profile_picture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Tính số lượng chưa đọc thực tế của mỗi phân loại trong toàn bộ database
      const unreadCounts = {
        message: await Notification.countDocuments({ receiver: userId, type: "message", isRead: false }),
        interaction: await Notification.countDocuments({ receiver: userId, type: { $in: ["like_post", "comment_post", "reply_comment"] }, isRead: false }),
        friend: await Notification.countDocuments({ receiver: userId, type: { $in: ["friend_request", "friend_accept"] }, isRead: false }),
        system: await Notification.countDocuments({ receiver: userId, type: "system", isRead: false }),
      };

      return {
        status: 200,
        data: {
          success: true,
          notifications,
          unreadCounts,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalNotifications: total,
            hasMore: skip + notifications.length < total,
          },
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống khi lấy thông báo: " + error.message,
        },
      };
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, receiver: userId },
        { isRead: true },
        { new: true }
      ).populate("sender", "_id username full_name profile_picture");

      if (!notification) {
        return {
          status: 444,
          data: {
            success: false,
            message: "Không tìm thấy thông báo hoặc bạn không có quyền cập nhật",
          },
        };
      }

      return {
        status: 200,
        data: {
          success: true,
          notification,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống khi cập nhật thông báo: " + error.message,
        },
      };
    }
  }

  async updateNotification(notificationId, userId, updateFields) {
    try {
      const fieldsToUpdate = {};
      if (updateFields.isRead !== undefined) {
        fieldsToUpdate.isRead = updateFields.isRead;
      }
      if (updateFields.action !== undefined) {
        fieldsToUpdate.action = updateFields.action;
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, receiver: userId },
        { $set: fieldsToUpdate },
        { new: true }
      ).populate("sender", "_id username full_name profile_picture");

      if (!notification) {
        return {
          status: 444,
          data: {
            success: false,
            message: "Không tìm thấy thông báo hoặc bạn không có quyền cập nhật",
          },
        };
      }

      return {
        status: 200,
        data: {
          success: true,
          notification,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống khi cập nhật thông báo: " + error.message,
        },
      };
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notification.updateMany({ receiver: userId, isRead: false }, { isRead: true });

      return {
        status: 200,
        data: {
          success: true,
          message: "Đã đánh dấu tất cả thông báo là đã đọc",
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống: " + error.message,
        },
      };
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.deleteOne({ _id: notificationId, receiver: userId });

      if (result.deletedCount === 0) {
        return {
          status: 444,
          data: {
            success: false,
            message: "Không tìm thấy thông báo hoặc bạn không có quyền xóa",
          },
        };
      }

      return {
        status: 200,
        data: {
          success: true,
          message: "Đã xóa thông báo thành công",
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống khi xóa thông báo: " + error.message,
        },
      };
    }
  }
}

export default new NotificationService();
