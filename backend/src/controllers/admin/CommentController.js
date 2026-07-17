import CommentService from "../../services/admin/CommentService.js";

class CommentController {
  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const result = await CommentService.toggleActive(id);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái khóa bình luận: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async toggleDelete(req, res) {
    try {
      const { id } = req.params;
      const result = await CommentService.toggleDelete(id);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái xóa bình luận: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }
}

export default new CommentController();
