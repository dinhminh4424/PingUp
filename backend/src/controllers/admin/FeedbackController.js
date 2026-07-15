import FeedbackService from "../../services/admin/FeedbackService.js";

class FeedbackController {
  async getFeedbacks(req, res) {
    try {
      const {
        searchTerm,
        filterCategory,
        filterRating,
        startDate,
        endDate,
        page = 1,
      } = req.query;
      const result = await FeedbackService.getFeedbacks(
        searchTerm,
        filterRating,
        filterCategory,
        startDate,
        endDate,
        page,
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách feedbacks: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new FeedbackController();
