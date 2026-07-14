import MessageService from "../../services/admin/MessageService.js";

class MessageController {
  async getConversations(req, res) {
    try {
      const {
        searchQuery,
        statusFilter,
        startDate,
        endDate,
        page = 1,
      } = req.query;
      const result = await MessageService.getConversations(
        searchQuery,
        statusFilter,
        startDate,
        endDate,
        page,
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách conversations: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new MessageController();
