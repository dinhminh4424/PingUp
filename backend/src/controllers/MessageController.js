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
      const { conversationId, content, replyTo } = req.body;
      const senderId = req.user._id;

      let imageUrls = [];
      let filesData = [];

      if (req.files) {
        // Upload images
        if (req.files.images && req.files.images.length > 0) {
          for (const file of req.files.images) {
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

        // Upload documents/files
        if (req.files.files && req.files.files.length > 0) {
          for (const file of req.files.files) {
            try {
              const originalName = file.originalname;
              const lastDotIndex = originalName.lastIndexOf(".");
              const nameWithoutExt = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
              const ext = lastDotIndex !== -1 ? originalName.substring(lastDotIndex) : "";
              
              const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, "_");
              const uniquePublicId = `${cleanName}_${Date.now()}${ext}`;

              const uploadResult = await uploadImageFromBuffer(file.buffer, {
                folder: "minh_Pingup/files",
                resource_type: "raw",
                public_id: uniquePublicId
              });
              
              const getReadableSize = (bytes) => {
                if (bytes === 0) return "0 Bytes";
                const k = 1024;
                const sizes = ["Bytes", "KB", "MB", "GB"];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
              };

              filesData.push({
                url: uploadResult.secure_url,
                name: file.originalname,
                size: getReadableSize(file.size)
              });
            } catch (uploadError) {
              console.error("Lỗi khi tải tệp tin lên Cloudinary: ", uploadError);
            }
          }
        }
      }

      if (!content && imageUrls.length === 0 && filesData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Nội dung tin nhắn không được để trống",
        });
      }

      const result = await MessageService.sendMessage(
        conversationId,
        senderId,
        content,
        imageUrls,
        filesData,
        replyTo
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

  async reactToMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.user._id;

      if (!emoji) {
        return res.status(400).json({
          success: false,
          message: "Thiếu biểu cảm emoji"
        });
      }

      const result = await MessageService.reactToMessage(messageId, userId, emoji);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi bày tỏ biểu cảm: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message
      });
    }
  }
}

export default new MessageController();
