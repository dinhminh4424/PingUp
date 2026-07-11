import StatsService from "../../services/admin/StatsService.js";

class StatsController {
  async getOverviewStats(req, res) {
    try {
      const result = await StatsService.getOverviewStats();
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy overview stats: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy overview stats: " + error.message,
      });
    }
  }

  async getUserStats(req, res) {
    try {
      const { period = "7days", role = "all", status = "all", startDate, endDate } = req.query;
      const result = await StatsService.getUserStats(period, role, status, startDate, endDate);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy user stats: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy user stats: " + error.message,
      });
    }
  }

  async getPostStats(req, res) {
    try {
      const { period = "7days", postType = "all", startDate, endDate } = req.query;
      const result = await StatsService.getPostStats(period, postType, startDate, endDate);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy post stats: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy post stats: " + error.message,
      });
    }
  }

  async getReportStats(req, res) {
    try {
      const { period = "7days", targetType = "all", status = "all", startDate, endDate } = req.query;
      const result = await StatsService.getReportStats(period, targetType, status, startDate, endDate);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy report stats: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy report stats: " + error.message,
      });
    }
  }

  async getStoryStats(req, res) {
    try {
      const { period = "7days", storyType = "all", startDate, endDate } = req.query;
      const result = await StatsService.getStoryStats(period, storyType, startDate, endDate);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy story stats: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy story stats: " + error.message,
      });
    }
  }

  async getMessageStats(req, res) {
    try {
      const { period = "7days", startDate, endDate } = req.query;
      const result = await StatsService.getMessageStats(period, startDate, endDate);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy message stats: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy message stats: " + error.message,
      });
    }
  }
}

export default new StatsController();
