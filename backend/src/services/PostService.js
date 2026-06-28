import Post from "../models/Post.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";

class PostService {
  async getPost() {
    try {
      const posts = await Post.find({
        isActive: true,
        isDelete: false,
      })
        .populate(
          "user",
          "_id email username full_name bio profile_picture cover_photo location ",
        )
        .sort({ createdAt: -1 });

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

  async getPostsByIdUser(id) {
    try {
      const posts = await Post.find({
        isActive: true,
        isDelete: false,
        user: id,
      })
        .populate(
          "user",
          "_id email username full_name bio profile_picture cover_photo location ",
        )
        .sort({ createdAt: -1 });

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách thành công getPostsByIdUser",
          posts: posts,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống getPostsByIdUser: " + error.message,
        },
      };
    }
  }

  async createPost(content, files, userId) {
    try {
      let post_type = "";
      if (content && files && files.length > 0) {
        post_type = "text_with_image";
      } else if ((!files || files.length === 0) && content) {
        post_type = "text";
      } else if (!content && files && files.length > 0) {
        post_type = "image";
      } else {
        return {
          status: 403,
          data: {
            success: false,
            message: "Thiếu dữ liệu: ",
          },
        };
      }

      const listImage = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const uploadResult = await uploadImageFromBuffer(file.buffer);
          listImage.push(uploadResult.secure_url);
        }
      }

      const post = await Post.create({
        content,
        post_type,
        image_urls: listImage,
        user: userId,
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Tạo bài viết thành công",
          post: post,
        },
      };
    } catch (error) {
      console.log("Lỗi hệ thống Đăng Bài: ", error);
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
