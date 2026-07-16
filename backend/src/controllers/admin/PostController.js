import PostService from "../../services/admin/PostService.js";

class PostController {
  async getPosts(req, res) {
    try {
      const { searchQuery, statusFilter, startDate, endDate, page = 1 } = req.query;
      const result = await PostService.getPosts(
        searchQuery,
        statusFilter,
        startDate,
        endDate,
        page
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách posts admin: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const result = await PostService.toggleActive(id);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi toggle active post: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async toggleDelete(req, res) {
    try {
      const { id } = req.params;
      const result = await PostService.toggleDelete(id);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi toggle delete post: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async getReportPost(req, res) {
    try {
      const result = await PostService.getReportPost();
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy báo cáo bài viết: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new PostController();
