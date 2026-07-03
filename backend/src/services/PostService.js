import Post from "../models/Post.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";
import { io } from "../socket/index.js";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import NotificationService from "./NotificationService.js";
import Comment from "../models/Comment.js";

class PostService {
  async getPost(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const total = await Post.countDocuments({
        isActive: true,
        isDelete: false,
      });

      const posts = await Post.find({
        isActive: true,
        isDelete: false,
      })
        .populate(
          "user",
          "_id email username full_name bio profile_picture cover_photo location ",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const postsWithCommentsCount = await Promise.all(
        posts.map(async (post) => {
          const commentCount = await Comment.countDocuments({
            post: post._id,
            isDelete: false,
            isActive: true,
          });
          return {
            ...post.toObject(),
            comments_count: commentCount,
          };
        })
      );

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách thành công",
          posts: postsWithCommentsCount,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total,
            hasMore: skip + posts.length < total,
          },
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

      const postsWithCommentsCount = await Promise.all(
        posts.map(async (post) => {
          const commentCount = await Comment.countDocuments({
            post: post._id,
            isDelete: false,
            isActive: true,
          });
          return {
            ...post.toObject(),
            comments_count: commentCount,
          };
        })
      );

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách thành công getPostsByIdUser",
          posts: postsWithCommentsCount,
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

      const postWithUser = await Post.findById(post._id).populate("user");

      // Socket

      // Lấy danh sách bạn bè
      const connections = await Connection.find({
        $or: [{ userA: userId }, { userB: userId }],
      });
      console.log("connections:", connections);

      const friends = connections
        .map((c) => {
          return c.userA.toString() === userId.toString() ? c.userB : c.userA;
        })
        .filter(Boolean);

      console.log("friends:", friends);

      // gửi thông báo
      for (let i of friends) {
        console.log("i: ", i.toString());

        io.to(i.toString()).emit("post:new", { post: postWithUser });
      }

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

  async updatePost(id, content, image_urls_old_remove, files, userId) {
    try {
      const post = await Post.findById(id);
      console.log(" 1. post.user: ", post.user, " - userId: ", userId);

      if (post.user.toString() !== userId.toString()) {
        console.log(" 2. post.user: ", post.user, " - userId: ", userId);
        return {
          status: 403,
          data: {
            success: false,
            message:
              "Không có quyền (không phải người đăng bài): " +
              id +
              " - userId: " +
              userId,
          },
        };
      }

      const oldRemove = image_urls_old_remove || [];

      const listImage = post.image_urls
        ? post.image_urls.filter((image) => !oldRemove.includes(image))
        : [];

      if (files && files.length > 0) {
        for (const file of files) {
          const uploadResult = await uploadImageFromBuffer(file.buffer);
          listImage.push(uploadResult.secure_url);
        }
      }

      let post_type = "";
      if (content && listImage && listImage.length > 0) {
        post_type = "text_with_image";
      } else if ((!listImage || listImage.length === 0) && content) {
        post_type = "text";
      } else if (!content && listImage && listImage.length > 0) {
        post_type = "image";
      } else {
        console.log("Thiếu dữ liệu nha ");
        return {
          status: 403,
          data: {
            success: false,
            message: "Thiếu dữ liệu !!! ",
          },
        };
      }

      const postNew = await Post.findByIdAndUpdate(
        id,
        {
          content,
          post_type,
          image_urls: listImage,
          user: userId,
        },
        {
          new: true, // Trả về document sau khi update
          runValidators: true, // (Khuyến nghị) chạy validator của schema
        },
      ).populate(
        "user",
        "_id email username full_name bio profile_picture cover_photo location ",
      );

      return {
        status: 200,
        data: {
          success: true,
          message: "Cạp nhật bài viết thành công thành công" + postNew,
          post: postNew,
        },
      };
    } catch (error) {
      console.log("Lỗi hệ thống cập nhật vài viết: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống cập nhật vài viết: " + error.message,
        },
      };
    }
  }

  async deletePost(id, userId) {
    try {
      const post = await Post.findById(id);
      if (!post) {
        return {
          status: 404,
          data: {
            success: false,
            message: "Không tìm thấy bài viết",
          },
        };
      }

      if (post.user.toString() !== userId.toString()) {
        return {
          status: 403,
          data: {
            success: false,
            message: "Không có quyền xóa bài viết này",
          },
        };
      }

      post.isDelete = true;
      await post.save();

      return {
        status: 200,
        data: {
          success: true,
          message: "Xóa bài viết thành công",
        },
      };
    } catch (error) {
      console.log("Lỗi khi xóa bài viết: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống: " + error.message,
        },
      };
    }
  }

  async toggleLike(id, userId) {
    try {
      const post = await Post.findById(id).populate("user");
      if (!post) {
        return {
          status: 404,
          data: {
            success: false,
            message: "Không tìm thấy bài viết",
          },
        };
      }

      const check = post.likes_count.some(
        (id) => id.toString() === userId.toString(),
      );

      const userCurrent = await User.findById(userId);
      if (check) {
        post.likes_count = post.likes_count.filter(
          (id) => id.toString() !== userId.toString(),
        );
        if (post.user._id.toString() !== userId.toString()) {
          const result = await NotificationService.createNotification({
            receiver: post.user,
            sender: userCurrent._id,
            content: `${userCurrent.username} đã bỏ thích bài viết của bạn.`,
            type: "like_post",
            detailType: "unlike",
            referenceId: id,
            link: `/post/${id}`,
          });
          // console.log(
          //   "Gửi cho room post.user._id.toString(): ",
          //   post.user._id.toString(),
          // );
          io.to(post.user._id.toString()).emit("post:unlike", {
            post: post,
            notification: result.notification,
          });
        }
      } else {
        post.likes_count.push(userId);

        if (post.user._id.toString() !== userId.toString()) {
          const result = await NotificationService.createNotification({
            receiver: post.user,
            sender: userCurrent._id,
            content: `${userCurrent.username} đã thích bài viết của bạn.`,
            type: "like_post",
            detailType: "like",
            referenceId: id,
            link: `/post/${id}`,
          });
          // console.log(
          //   "Gửi cho room post.user._id.toString(): ",
          //   post.user._id.toString(),
          // );
          io.to(post.user._id.toString()).emit("post:like", {
            post: post,
            notification: result.notification,
          });
        }
      }

      await post.save();

      return {
        status: 200,
        data: {
          success: true,
          message: check
            ? "Đã huỷ thích thành công"
            : "Đã bày tỏ cảm xúc thành công",
          post: post,
        },
      };
    } catch (error) {
      console.log("Lỗi khi bày tỏ cảm xúc: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống khi bày tỏ cảm xúc: " + error.message,
        },
      };
    }
  }
}

export default new PostService();
