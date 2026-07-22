import CommentService from "../services/CommentService.js";
import ActivityLogService from "../services/ActivityLogService.js";

class CommentController {
  async createComment(req, res) {
    try {
      const { postId, content, parentCommentId } = req.body;
      const file = req.file; // multer file
      const userId = req.user._id;

      if ((!content || content.trim() === "") && !file) {
        return res.status(400).json({
          success: false,
          message: "Bình luận phải có nội dung chữ hoặc hình ảnh",
        });
      }

      const result = await CommentService.createComment(
        postId,
        userId,
        content,
        parentCommentId,
        file
      );

      if (result.status === 201 && result.data?.success) {
        await ActivityLogService.log({
          userId,
          action: "CREATE_COMMENT",
          entityType: "COMMENT",
          entityId: result.data.comment?._id,
          details: { postId, contentSnippet: content ? content.slice(0, 100) : "" },
          req,
        });
      }

      return res.status(result.status).json(result.data);

    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async getCommentsByPost(req, res) {
    try {
      const { postId } = req.params;
      const result = await CommentService.getCommentsByPost(postId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async toggleLikeComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const result = await CommentService.toggleLikeComment(id, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi thích bình luận:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const result = await CommentService.deleteComment(id, userId);

      if (result.status === 200 && result.data?.success) {
        await ActivityLogService.log({
          userId,
          action: "DELETE_COMMENT",
          entityType: "COMMENT",
          entityId: id,
          req,
        });
      }

      return res.status(result.status).json(result.data);

    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: " + error.message,
      });
    }
  }

  async createReportComment(req, res) {
    try {
      const { id } = req.params;
      const { targetType, reason, details } = req.body;
      const files = req.files;
      const userId = req.user._id;

      const result = await CommentService.createReportComment(
        id,
        targetType,
        userId,
        reason,
        details,
        files
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi Tạo Báo Cáo Bình Luận: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi Khi Tạo Báo Cáo Bình Luận: " + error.message,
      });
    }
  }
}

export default new CommentController();
