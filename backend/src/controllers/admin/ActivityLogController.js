import ActivityLogService from "../../services/ActivityLogService.js";

class ActivityLogController {
  async getAllLogs(req, res) {
    try {
      const { page = 1, limit = 20, actionFilter = "", searchQuery = "" } = req.query;
      const result = await ActivityLogService.getAllLogs(
        parseInt(page),
        parseInt(limit),
        actionFilter,
        searchQuery
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhật ký hoạt động:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async getLogStats(req, res) {
    try {
      const result = await ActivityLogService.getLogStats();
      return res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê nhật ký hoạt động:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async getSuspiciousActivities(req, res) {
    try {
      const result = await ActivityLogService.getSuspiciousActivities();
      return res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi khi lấy cảnh báo bất thường:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new ActivityLogController();
