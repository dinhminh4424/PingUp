import MessageService from "../services/MessageService.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";

class MessageController {
  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await MessageService.getMessages(conversationId, page, limit);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy tin nhắn: " + error.message,
      });
    }
  }

  async sendMessage(req, res) {
    try {
      const { conversationId, content } = req.body;
      const senderId = req.user._id;

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const uploadResult = await uploadImageFromBuffer(file.buffer, {
              folder: "minh_Pingup/messages",
            });
            imageUrls.push(uploadResult.secure_url);
          } catch (uploadError) {
            console.error("Lỗi khi tải ảnh tin nhắn lên Cloudinary: ", uploadError);
          }
        }
      }

      if (!content && imageUrls.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Nội dung tin nhắn không được để trống",
        });
      }

      const result = await MessageService.sendMessage(
        conversationId,
        senderId,
        content,
        imageUrls
      );

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi gửi tin nhắn: " + error.message,
      });
    }
  }
}

export default new MessageController();
