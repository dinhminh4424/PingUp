import User from "../../models/User.js";
import Post from "../../models/Post.js";
import Report from "../../models/Report.js";
import Comment from "../../models/Comment.js";

class PostService {
  // Get all posts for admin panel with search, status filters, and pagination
  async getPosts(searchQuery, statusFilter, startDate, endDate, page = 1) {
    try {
      const limit = 10;
      const pageNumber = Math.max(1, parseInt(page) || 1);
      const skip = (pageNumber - 1) * limit;

      let search = {};

      // Filter by search query (content or author name/username)
      if (searchQuery) {
        const matchedUsers = await User.find({
          $or: [
            { full_name: { $regex: searchQuery, $options: "i" } },
            { username: { $regex: searchQuery, $options: "i" } },
          ],
        }).select("_id");
        const userIds = matchedUsers.map((u) => u._id);

        search.$or = [
          { content: { $regex: searchQuery, $options: "i" } },
          { user: { $in: userIds } },
        ];
      }

      // Filter by status
      if (statusFilter === "deleted") {
        search.isDelete = true;
      } else {
        search.isDelete = false;
        if (statusFilter === "active") {
          search.isActive = true;
        } else if (statusFilter === "blocked") {
          search.isActive = false;
        }
      }

      // Filter by date range
      if (startDate || endDate) {
        search.createdAt = {};
        if (startDate) {
          search.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          search.createdAt.$lte = end;
        }
      }

      // Query posts
      const posts = await Post.find(search)
        .populate("user", "_id username full_name profile_picture email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Append report counts, comments list, reports details, and stats to posts
      const postsWithStats = await Promise.all(
        posts.map(async (post) => {
          const reports = await Report.find({
            targetId: post._id,
            targetType: "post",
          }).populate("reporterId", "_id username full_name profile_picture");

          const comments = await Comment.find({ post: post._id, isDelete: false })
            .populate("user", "_id username full_name profile_picture")
            .sort({ createdAt: -1 });

          return {
            ...post.toObject(),
            reports_count: reports.length,
            reports: reports,
            likesCountValue: post.likes_count ? post.likes_count.length : 0,
            comments_count: comments.length,
            comments: comments,
          };
        }),
      );

      const totalFilteredPosts = await Post.countDocuments(search);

      // Overall stats for admin dashboard
      const totalPosts = await Post.countDocuments({ isDelete: false });
      const activePosts = await Post.countDocuments({ isDelete: false, isActive: true });
      const blockedPosts = await Post.countDocuments({ isDelete: false, isActive: false });
      const deletedPosts = await Post.countDocuments({ isDelete: true });

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách bài viết thành công!",
          posts: postsWithStats,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalFilteredPosts / limit),
            totalPosts: totalFilteredPosts,
            limit,
          },
          stats: {
            totalPosts,
            activePosts,
            blockedPosts,
            deletedPosts,
          },
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy danh sách bài viết admin: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống: " + error.message,
        },
      };
    }
  }

  // Toggle active status (block / unblock post)
  async toggleActive(id) {
    try {
      const post = await Post.findById(id);
      if (!post) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy bài viết" },
        };
      }
      post.isActive = !post.isActive;
      await post.save();

      return {
        status: 200,
        data: {
          success: true,
          message: `Đã ${post.isActive ? "kích hoạt" : "khóa"} bài viết thành công`,
          post,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống thay đổi trạng thái hoạt động của bài viết: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  // Toggle comments disabled status for a post
  async toggleCommentDisabled(id) {
    try {
      const post = await Post.findById(id);
      if (!post) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy bài viết" },
        };
      }
      post.isCommentDisabled = !post.isCommentDisabled;
      await post.save();

      return {
        status: 200,
        data: {
          success: true,
          message: `Đã ${post.isCommentDisabled ? "khóa" : "mở khóa"} tính năng bình luận của bài viết thành công`,
          post,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống thay đổi trạng thái tính năng bình luận: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  // Toggle delete status (soft delete / restore post)
  async toggleDelete(id) {
    try {
      const post = await Post.findById(id);
      if (!post) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy bài viết" },
        };
      }
      post.isDelete = !post.isDelete;
      await post.save();

      return {
        status: 200,
        data: {
          success: true,
          message: `Đã ${post.isDelete ? "xóa" : "khôi phục"} bài viết thành công`,
          post,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống thay đổi trạng thái xóa của bài viết: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  // Get reports for posts
  async getReportPost() {
    try {
      const reports = await Report.find({ targetType: "post" })
        .populate("reporterId", "_id username full_name profile_picture")
        .sort({ createdAt: -1 });

      // Populate targeted post details manually since targetId refs can be dynamic
      const populatedReports = await Promise.all(
        reports.map(async (report) => {
          const targetPost = await Post.findById(report.targetId)
            .populate("user", "_id username full_name profile_picture")
            .select("content image_urls user isActive isDelete");
          return {
            ...report.toObject(),
            post: targetPost,
          };
        }),
      );

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy báo cáo bài viết thành công!",
          reports: populatedReports,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy báo cáo bài viết: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }
}

export default new PostService();
