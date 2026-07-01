import ConversationService from "../services/ConversationService.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";

class ConversationController {
  async getConversation(req, res) {
    try {
      const user = req.user;
      const result = await ConversationService.getConversations(user._id);

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi lấy danh sách hộp thoại: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách hộp thoại: " + error.message,
      });
    }
  }

  async createConversation(req, res) {
    try {
      const { type, name, memberIds } = req.body;
      const user = req.user;

      // Xử lý memberIds gửi qua FormData (dưới dạng chuỗi JSON hoặc chuỗi phân tách dấu phẩy)
      let parsedMemberIds = memberIds;
      if (typeof memberIds === "string") {
        try {
          parsedMemberIds = JSON.parse(memberIds);
        } catch (e) {
          parsedMemberIds = memberIds
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);
        }
      }

      if (
        !type ||
        (type === "group" && !name) ||
        !parsedMemberIds ||
        !parsedMemberIds.length ||
        !Array.isArray(parsedMemberIds)
      ) {
        console.log("Thiếu thông tin Hộp Thoại ");
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin tạo hộp thoại (type, name, hoặc memberIds)",
        });
      }

      // Xử lý tải ảnh đại diện nhóm lên Cloudinary nếu có
      let imageGroup = "";
      if (type === "group" && req.file) {
        try {
          const uploadResult = await uploadImageFromBuffer(req.file.buffer);
          imageGroup = uploadResult.secure_url;
        } catch (uploadError) {
          console.error("Lỗi khi tải ảnh nhóm lên Cloudinary: ", uploadError);
        }
      }

      const result = await ConversationService.createConversation(
        type,
        name,
        parsedMemberIds,
        user._id,
        imageGroup,
      );

      return res.status(result.status).json(result.data);
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
