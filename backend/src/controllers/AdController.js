import AdService from "../services/AdService.js";

class AdController {
  async createCampaign(req, res) {
    try {
      const file = req.file; // multer single image
      const advertiserId = req.user._id;

      const result = await AdService.createCampaign(req.body, file, advertiserId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.createCampaign:", error);
      return res.status(500).json({ success: false, message: "Lỗi tạo chiến dịch: " + error.message });
    }
  }

  async getCampaigns(req, res) {
    try {
      const advertiserId = req.user._id;
      const result = await AdService.getCampaigns(advertiserId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.getCampaigns:", error);
      return res.status(500).json({ success: false, message: "Lỗi lấy danh sách: " + error.message });
    }
  }

  async toggleCampaignStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // active or paused
      const advertiserId = req.user._id;

      const result = await AdService.toggleCampaignStatus(id, advertiserId, status);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.toggleCampaignStatus:", error);
      return res.status(500).json({ success: false, message: "Lỗi đổi trạng thái: " + error.message });
    }
  }

  async serveAds(req, res) {
    try {
      const { placement } = req.query;
      const userAge = req.user ? (new Date().getFullYear() - new Date(req.user.createdAt).getFullYear()) + 18 : 20;
      const userLocation = req.user ? req.user.location : "";

      const result = await AdService.serveAds(placement, userAge, userLocation);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.serveAds:", error);
      return res.status(500).json({ success: false, message: "Lỗi phân phối quảng cáo" });
    }
  }

  async trackEvent(req, res) {
    try {
      const { campaignId, eventType, placement } = req.body;
      const userId = req.user ? req.user._id : null;
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || "";
      const userAgent = req.headers["user-agent"] || "";

      const result = await AdService.trackEvent(campaignId, eventType, placement, userId, ipAddress, userAgent);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.trackEvent:", error);
      return res.status(500).json({ success: false, message: "Lỗi tracking event" });
    }
  }

  async updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;
      const advertiserId = req.user._id;

      const result = await AdService.updateCampaign(id, req.body, file, advertiserId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.updateCampaign:", error);
      return res.status(500).json({ success: false, message: "Lỗi cập nhật chiến dịch" });
    }
  }

  async deleteCampaign(req, res) {
    try {
      const { id } = req.params;
      const advertiserId = req.user._id;
      const isAdmin = req.user.role === "admin";

      const result = await AdService.deleteCampaign(id, advertiserId, isAdmin);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.deleteCampaign:", error);
      return res.status(500).json({ success: false, message: "Lỗi xóa chiến dịch" });
    }
  }

  async submitLead(req, res) {
    try {
      const { id } = req.params;
      const { answers } = req.body;
      const userId = req.user ? req.user._id : null;
      const files = req.files || [];
      
      const result = await AdService.submitLead(id, answers, userId, files);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.submitLead:", error);
      return res.status(500).json({ success: false, message: "Lỗi gửi thông tin lead form" });
    }
  }

  async getLeads(req, res) {
    try {
      const advertiserId = req.user._id;
      const result = await AdService.getLeads(advertiserId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.getLeads:", error);
      return res.status(500).json({ success: false, message: "Lỗi lấy danh sách khách hàng đăng ký" });
    }
  }

  async deleteLead(req, res) {
    try {
      const { id } = req.params;
      const advertiserId = req.user._id;
      const isAdmin = req.user.role === "admin";

      const result = await AdService.deleteLead(id, advertiserId, isAdmin);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.deleteLead:", error);
      return res.status(500).json({ success: false, message: "Lỗi xóa đăng ký" });
    }
  }

  /**
   * Tải tệp tin trong biểu mẫu quảng cáo lên Cloudinary
   */
  async uploadFile(req, res) {
    try {
      const result = await AdService.uploadFile(req.file);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong AdController.uploadFile:", error);
      return res.status(500).json({ success: false, message: "Lỗi tải tệp: " + error.message });
    }
  }
}

export default new AdController();
