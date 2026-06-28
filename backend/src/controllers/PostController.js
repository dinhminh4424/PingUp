import PostService from "../services/PostService.js";

class PostController {
  async getPost(req, res) {
    try {
      const result = await PostService.getPost();
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

      const result = await PostService.getPostsByIdUser(userId);
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

  async updatePost(req, res) {}

  async deletePost(req, res) {}

  async likePost(req, res) {}

  async commentPost(req, res) {}
}

export default new PostController();
