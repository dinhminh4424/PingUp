import MessageService from "../../services/admin/MessageService.js";

class MessageController {
  async getConversations(req, res) {
    try {
      const { searchQuery, statusFilter, startDate, endDate, page = 1 } = req.query;
      const result = await MessageService.getConversations(
        searchQuery,
        statusFilter,
        startDate,
        endDate,
        page
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

  async getConversationMessages(req, res) {
    try {
      const { id } = req.params;
      const { page = 1 } = req.query;
      const result = await MessageService.getConversationMessages(id, page);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn conversation: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const result = await MessageService.deleteMessage(id);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async deleteConversation(req, res) {
    try {
      const { id } = req.params;
      const result = await MessageService.deleteConversation(id);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi xóa cuộc hội thoại: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const result = await MessageService.toggleActive(id);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi toggle active conversation: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async toggleDelete(req, res) {
    try {
      const { id } = req.params;
      const result = await MessageService.toggleDelete(id);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi toggle delete conversation: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new MessageController();
