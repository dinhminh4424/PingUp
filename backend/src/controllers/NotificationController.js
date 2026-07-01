import NotificationService from "../services/NotificationService.js";

class NotificationController {
  async getNotifications(req, res) {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const tab = req.query.tab || "all";
      const unreadOnly = req.query.unreadOnly === "true";

      const result = await NotificationService.getNotifications(userId, page, limit, tab, unreadOnly);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông báo: " + error.message,
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const result = await NotificationService.markAsRead(id, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái thông báo:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async updateNotification(req, res) {
    try {
      const { id } = req.params;
      const { isRead, action } = req.body;
      const userId = req.user._id;
      const result = await NotificationService.updateNotification(id, userId, { isRead, action });
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông báo:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user._id;
      const result = await NotificationService.markAllAsRead(userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc tất cả thông báo:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const result = await NotificationService.deleteNotification(id, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new NotificationController();
