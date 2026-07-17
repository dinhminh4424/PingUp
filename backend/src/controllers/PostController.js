import PostService from "../services/PostService.js";

class PostController {
  async getPost(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await PostService.getPost(page, limit);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi lấy danh sách: ", error);
      return res.status(500).json({
        success: false,
        message: "Lấy danh sách thất bại: " + error.message,
      });
    }
  }

  async getPostsByIdUser(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?._id;

      const result = await PostService.getPostsByIdUser(userId, currentUserId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi lấy danh sách getPostsByIdUser: ", error);
      return res.status(500).json({
        success: false,
        message: "Lấy danh sách thất bại getPostsByIdUser: " + error.message,
      });
    }
  }

  async createPost(req, res) {
    try {
      const { content } = req.body;
      const files = req.files;
      const userId = req.user._id;

      const result = await PostService.createPost(content, files, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi thêm bài viết: ", error);
      return res.status(500).json({
        success: false,
        message: "Lấy tạo post thất bại: " + error.message,
      });
    }
  }

  async createReportPost(req, res) {
    try {
      const { id } = req.params;
      const { targetType, reason, details } = req.body;
      const files = req.files;
      const userId = req.user._id;

      const result = await PostService.createReportPost(
        id,
        targetType,
        userId,
        reason,
        details,
        files
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi Tạo Báo Cáo: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi Khi Tạo Báo Cáo: " + error.message,
      });
    }
  }

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { content, image_urls_old_remove } = req.body;
      const files = req.files;
      const userId = req.user._id;

      const result = await PostService.updatePost(
        id,
        content,
        image_urls_old_remove,
        files,
        userId,
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi Cập nhật bài viết: ", error);
      return res.status(500).json({
        success: false,
        message: "Cập nhật bài viết thất bại: " + error.message,
      });
    }
  }

  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const result = await PostService.deletePost(id, userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi xóa bài viết: ", error);
      return res.status(500).json({
        success: false,
        message: "Xóa bài viết thất bại: " + error.message,
      });
    }
  }

  async toggleLike(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      if (!userId) {
        console.log("Bạn cần đăng nhập:", error);
        res.status(403).json({
          success: false,
          message: "Lỗi khi người dùng chưa đăng nhập: " + error.message,
        });
      }

      const result = await PostService.toggleLike(id, userId);

      res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin người dùng: " + error.message,
      });
    }
  }

  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const result = await PostService.getPostById(id);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi lấy chi tiết bài viết: ", error);
      return res.status(500).json({
        success: false,
        message: "Lấy chi tiết bài viết thất bại: " + error.message,
      });
    }
  }

  async sharePost(req, res) {
    try {
      const { originalPostId, content } = req.body;
      const userId = req.user._id;
      const result = await PostService.sharePost(
        originalPostId,
        content,
        userId,
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi share bài viết: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi share bài viết: " + error.message,
      });
    }
  }

  async getLikedPosts(req, res) {
    try {
      const { userId } = req.params;
      const result = await PostService.getLikedPostsByUserId(userId);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi khi lấy danh sách bài viết đã thích: ", error);
      return res.status(500).json({
        success: false,
        message: "Lấy danh sách bài viết đã thích thất bại: " + error.message,
      });
    }
  }
}

export default new PostController();
