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

  async getConversationById(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?._id;
      const result =
        await ConversationService.getConversationById(conversationId, userId);

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi lấy chi tiết hộp thoại: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy chi tiết hộp thoại: " + error.message,
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

  async updateConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const { name } = req.body;

      let imageGroup = undefined;
      if (req.file) {
        try {
          const uploadResult = await uploadImageFromBuffer(req.file.buffer);
          imageGroup = uploadResult.secure_url;
        } catch (uploadError) {
          console.error("Lỗi khi tải ảnh nhóm lên Cloudinary: ", uploadError);
        }
      }

      const result = await ConversationService.updateGroup(conversationId, name, imageGroup);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi cập nhật cuộc trò chuyện: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi cập nhật cuộc trò chuyện: " + error.message,
      });
    }
  }
  async updateCustomization(req, res) {
    try {
      const { conversationId } = req.params;
      const { themeType, themeValue, quickEmoji } = req.body;

      const result = await ConversationService.updateCustomization(
        conversationId,
        themeType,
        themeValue,
        quickEmoji
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi cập nhật tùy chỉnh hộp thoại: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi cập nhật tùy chỉnh hộp thoại: " + error.message,
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?._id;

      const result = await ConversationService.markAsRead(conversationId, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi đánh dấu đã đọc cuộc hội thoại: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi đánh dấu đã đọc cuộc hội thoại: " + error.message,
      });
    }
  }

  async leaveConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?._id;

      const result = await ConversationService.leaveGroup(conversationId, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi rời cuộc hội thoại: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi rời cuộc hội thoại: " + error.message,
      });
    }
  }

  async reportConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?._id;
      const { reason, details } = req.body;

      let reportImages = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const uploadResult = await uploadImageFromBuffer(file.buffer);
            reportImages.push(uploadResult.secure_url);
          } catch (uploadError) {
            console.error("Lỗi upload ảnh báo cáo: ", uploadError);
          }
        }
      }

      const result = await ConversationService.reportGroup(conversationId, userId, reason, details, reportImages);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi báo cáo cuộc hội thoại: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi báo cáo cuộc hội thoại: " + error.message,
      });
    }
  }

  async searchGroups(req, res) {
    try {
      const { query } = req.query;
      const result = await ConversationService.searchGroups(query || "");
      return res.status(result.status).json(result.data);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async requestToJoin(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?._id;
      const result = await ConversationService.requestToJoin(conversationId, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async approveJoinRequest(req, res) {
    try {
      const { conversationId } = req.params;
      const { userId } = req.body;
      const adminId = req.user?._id;
      const result = await ConversationService.approveJoinRequest(conversationId, userId, adminId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async rejectJoinRequest(req, res) {
    try {
      const { conversationId } = req.params;
      const { userId } = req.body;
      const adminId = req.user?._id;
      const result = await ConversationService.rejectJoinRequest(conversationId, userId, adminId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async disbandGroup(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?._id;
      const result = await ConversationService.disbandGroup(conversationId, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ConversationController();
