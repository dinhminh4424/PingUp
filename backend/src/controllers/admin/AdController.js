import AdService from "../../services/AdService.js";

class AdController {
  async getAdminCampaigns(req, res) {
    try {
      const result = await AdService.getAdminCampaigns();
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong admin.AdController.getAdminCampaigns:", error);
      return res.status(500).json({ success: false, message: "Lỗi lấy danh sách duyệt quảng cáo" });
    }
  }

  async reviewCampaign(req, res) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body; // approved or rejected

      const result = await AdService.reviewCampaign(id, status, rejectionReason);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong admin.AdController.reviewCampaign:", error);
      return res.status(500).json({ success: false, message: "Lỗi phê duyệt quảng cáo" });
    }
  }

  async deleteCampaign(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user._id;

      const result = await AdService.deleteCampaign(id, adminId, true); // true indicates isAdmin
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong admin.AdController.deleteCampaign:", error);
      return res.status(500).json({ success: false, message: "Lỗi xóa quảng cáo" });
    }
  }

  async getAdminLeads(req, res) {
    try {
      const result = await AdService.getAdminLeads();
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi trong admin.AdController.getAdminLeads:", error);
      return res.status(500).json({ success: false, message: "Lỗi lấy danh sách leads toàn hệ thống" });
    }
  }
}

export default new AdController();
