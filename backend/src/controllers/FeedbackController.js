import FeedbackService from "../services/FeedbackService.js";

class FeedbackController {
  async createFeedback(req, res) {
    try {
      const { category, rating, comment } = req.body;
      const userId = req.user._id;
      const files = req.files;

      const result = await FeedbackService.createFeedback(
        category,
        rating,
        comment,
        files,
        userId,
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi tạo feedbacks: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new FeedbackController();
