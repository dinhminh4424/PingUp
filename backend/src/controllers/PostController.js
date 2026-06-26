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

  async createPost(req, res) {
    const {} = req.body;
  }

  async updatePost(req, res) {}

  async deletePost(req, res) {}

  async likePost(req, res) {}

  async commentPost(req, res) {}
}

export default new PostController();
