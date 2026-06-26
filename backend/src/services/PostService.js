import Post from "../models/Post.js";

class PostService {
  async getPost() {
    try {
      const posts = await Post.find({
        isActive: true,
        isDelete: false,
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách thành công",
          posts: posts,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống: " + error.message,
        },
      };
    }
  }
}

export default new PostService();
