import SystemNotificationService from "../../services/admin/SystemNotificationService.js";

class SystemNotificationController {
  // ================= TEMPLATE =================
  async getTemplates(req, res) {
    try {
      const templates = await SystemNotificationService.getTemplates();
      return res.status(200).json({
        success: true,
        data: templates,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi lấy danh sách mẫu thông báo",
      });
    }
  }

  async createTemplate(req, res) {
    try {
      const adminId = req.user._id;
      const template = await SystemNotificationService.createTemplate(req.body, adminId);
      return res.status(201).json({
        success: true,
        message: "Tạo mẫu thông báo thành công",
        data: template,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Lỗi khi tạo mẫu thông báo",
      });
    }
  }

  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await SystemNotificationService.updateTemplate(id, req.body);
      return res.status(200).json({
        success: true,
        message: "Cập nhật mẫu thông báo thành công",
        data: template,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Lỗi khi cập nhật mẫu thông báo",
      });
    }
  }

  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      await SystemNotificationService.deleteTemplate(id);
      return res.status(200).json({
        success: true,
        message: "Xóa mẫu thông báo thành công",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Lỗi khi xóa mẫu thông báo",
      });
    }
  }

  // ================= UPLOAD IMAGE =================
  async uploadModalImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chọn 1 tệp hình ảnh",
        });
      }
      const imageUrl = await SystemNotificationService.uploadModalImage(req.file.buffer);
      return res.status(200).json({
        success: true,
        message: "Upload ảnh thành công",
        url: imageUrl,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi upload ảnh",
      });
    }
  }

  // ================= BROADCAST =================
  async sendBroadcast(req, res) {
    try {
      const adminId = req.user._id;
      const result = await SystemNotificationService.sendBroadcast(req.body, adminId);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.broadcast,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Lỗi khi gửi thông báo hệ thống",
      });
    }
  }

  async getBroadcastHistory(req, res) {
    try {
      const { page, limit, type, search } = req.query;
      const result = await SystemNotificationService.getBroadcastHistory({
        page,
        limit,
        type,
        search,
      });
      return res.status(200).json({
        success: true,
        data: result.broadcasts,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi lấy lịch sử phát thông báo",
      });
    }
  }

  async revokeBroadcast(req, res) {
    try {
      const { id } = req.params;
      await SystemNotificationService.revokeBroadcast(id);
      return res.status(200).json({
        success: true,
        message: "Thu hồi thông báo thành công",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Lỗi khi thu hồi thông báo",
      });
    }
  }
}

export default new SystemNotificationController();
