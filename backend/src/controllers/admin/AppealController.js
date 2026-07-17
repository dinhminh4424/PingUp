import AppealServices from "../../services/admin/AppealServices.js";

class AppealController {
  async getAppeals(req, res) {
    try {
      const {
        searchQuery,
        targetModelFilter,
        appealTypeFilter,
        statusFilter,
        startDate,
        endDate,
        page = 1,
      } = req.query;

      const result = await AppealServices.getAppeals(
        searchQuery,
        targetModelFilter,
        appealTypeFilter,
        statusFilter,
        startDate,
        endDate,
        page,
      );

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi Khi Lấy Danh Sách Báo Cáo: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ Thống: " + error.message,
      });
    }
  }

  async resolveAppeal(req, res) {
    try {
      const { id } = req.params;
      const { status, result: resultText } = req.body;
      const adminId = req.user._id;

      const result = await AppealServices.resolveAppeal(
        id,
        status,
        resultText,
        adminId
      );

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi giải quyết khiếu nại: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new AppealController();
