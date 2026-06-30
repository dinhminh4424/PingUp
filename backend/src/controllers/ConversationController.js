import ConversationService from "../services/ConversationService";

class ConversationController {
  async createConversation(req, res) {
    try {
      const { type, name, memberIds } = req;

      const user = req.user;

      if (
        !type ||
        (type == "group" && !name) ||
        !memberIds ||
        !memberIds.length ||
        !Array.isArray(memberIds)
      ) {
        console.log("Thiếu thông tin Hộp Thoại ");

        const result = await ConversationService.createConversation(
          type,
          name,
          memberIds,
        );

        return res.status(result.status).json(result.data);
      }
      participants.add({ userId: user._id, joinedAt: Date.now });
    } catch (error) {
      console.log("Lỗi khi tạo hộp thoại: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi tạo hộp thoại: " + error.message,
      });
    }
  }
}

export default new ConversationController();
