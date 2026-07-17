import Comment from "../../models/Comment.js";

class CommentService {
  // Toggle active status (block / unblock comment)
  async toggleActive(id) {
    try {
      const comment = await Comment.findById(id);
      if (!comment) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy bình luận" },
        };
      }
      comment.isActive = !comment.isActive;
      await comment.save();

      return {
        status: 200,
        data: {
          success: true,
          message: `Đã ${comment.isActive ? "kích hoạt" : "khóa"} bình luận thành công`,
          comment,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống thay đổi trạng thái hoạt động của bình luận: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  // Toggle delete status (soft delete / restore comment)
  async toggleDelete(id) {
    try {
      const comment = await Comment.findById(id);
      if (!comment) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy bình luận" },
        };
      }
      comment.isDelete = !comment.isDelete;
      if (comment.isDelete) {
        comment.deletedAt = new Date();
      } else {
        comment.deletedAt = null;
      }
      await comment.save();

      return {
        status: 200,
        data: {
          success: true,
          message: `Đã ${comment.isDelete ? "xóa" : "khôi phục"} bình luận thành công`,
          comment,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống thay đổi trạng thái xóa của bình luận: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }
}

export default new CommentService();
