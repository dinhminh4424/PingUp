import ReportService from "../../services/admin/ReportService.js";

class ReportController {
  async getReportPost(req, res) {
    try {
      const { searchQuery, statusFilter, startDate, endDate, page = 1, reasonFilter, reporterFilter } = req.query;
      const result = await ReportService.getReportPosts(
        searchQuery,
        statusFilter,
        startDate,
        endDate,
        page,
        reasonFilter,
        reporterFilter
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy report post: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy report post: " + error.message,
      });
    }
  }

  async getReportComment(req, res) {
    try {
      const { searchQuery, statusFilter, startDate, endDate, page = 1, reasonFilter, reporterFilter } = req.query;
      const result = await ReportService.getReportComments(
        searchQuery,
        statusFilter,
        startDate,
        endDate,
        page,
        reasonFilter,
        reporterFilter
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy report comment: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy report comment: " + error.message,
      });
    }
  }

  async updateReportStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await ReportService.updateReportStatus(id, status);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái báo cáo: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async getReportConversation(req, res) {
    try {
      const { searchQuery, statusFilter, startDate, endDate, page = 1, reasonFilter, reporterFilter } = req.query;
      const result = await ReportService.getReportConversations(
        searchQuery,
        statusFilter,
        startDate,
        endDate,
        page,
        reasonFilter,
        reporterFilter
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy report conversation: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy report conversation: " + error.message,
      });
    }
  }
}

export default new ReportController();
