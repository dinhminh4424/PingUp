import AppealServices from "../services/AppealServices.js";

class AppealController {
  async createAppeal(req, res) {
    try {
      const { targetId, reason, appealType, targetModel, details } = req.body;
      const files = req.files;
      const userId = req.user._id;

      if ((!reason || reason.trim() === "") && !file) {
        return res.status(400).json({
          success: false,
          message: "Kháng cáo phải có nội dung !!!!",
        });
      }

      const result = await AppealServices.createAppeal(
        targetId,
        reason,
        appealType,
        targetModel,
        details,
        files,
        userId,
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi gửi báo cáo:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async getMyAppeals(req, res) {
    try {
      const userId = req.user._id;
      const result = await AppealServices.getAppealsByUser(userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách kháng cáo: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new AppealController();
