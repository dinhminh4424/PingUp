import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import NotificationService from "./NotificationService.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";
import { io } from "../socket/index.js";

class CommentService {
  async createComment(postId, userId, content, parentCommentId = null, file = null) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy bài viết" },
        };
      }

      let imageUrl = null;
      if (file) {
        const uploadResult = await uploadImageFromBuffer(file.buffer);
        imageUrl = uploadResult.secure_url;
      }

      const comment = await Comment.create({
        post: postId,
        user: userId,
        content: content || "",
        parentComment: parentCommentId || null,
        image_urls: imageUrl,
      });

      // Populate user info for the newly created comment
      const populatedComment = await Comment.findById(comment._id).populate(
        "user",
        "_id username full_name profile_picture"
      );

      // Handle updating replies_count on parent comment if reply
      if (parentCommentId) {
        await Comment.findByIdAndUpdate(parentCommentId, {
          $inc: { replies_count: 1 },
        });
      }

      // Send real-time notification to post owner if comment is not by post owner
      const userCurrent = await User.findById(userId);
      if (post.user.toString() !== userId.toString()) {
        const notif = await NotificationService.createNotification({
          receiver: post.user,
          sender: userId,
          content: `${userCurrent.username} đã bình luận về bài viết của bạn.`,
          type: "comment",
          detailType: "comment",
          referenceId: postId,
          link: `/post/${postId}`,
        });

        io.to(post.user.toString()).emit("notification:new", {
          notification: notif.notification,
        });
      }

      return {
        status: 201,
        data: {
          success: true,
          message: "Bình luận thành công",
          comment: populatedComment,
        },
      };
    } catch (error) {
      console.error("Lỗi khi tạo bình luận:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  async getCommentsByPost(postId) {
    try {
      const comments = await Comment.find({
        post: postId,
        isDelete: false,
        isActive: true,
      })
        .populate("user", "_id username full_name profile_picture")
        .sort({ createdAt: 1 });

      const commentMap = {};
      const rootComments = [];

      comments.forEach((c) => {
        const cObj = c.toObject();
        cObj.replies = [];
        cObj.likesCount = c.likes.length;
        commentMap[cObj._id.toString()] = cObj;
      });

      comments.forEach((c) => {
        const cObj = commentMap[c._id.toString()];
        if (c.parentComment) {
          const parent = commentMap[c.parentComment.toString()];
          if (parent) {
            parent.replies.push(cObj);
          } else {
            rootComments.push(cObj);
          }
        } else {
          rootComments.push(cObj);
        }
      });

      return {
        status: 200,
        data: {
          success: true,
          comments: rootComments,
        },
      };
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  async toggleLikeComment(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy bình luận" },
        };
      }

      const likedIndex = comment.likes.indexOf(userId);
      let isLiked = false;
      if (likedIndex > -1) {
        comment.likes.splice(likedIndex, 1);
      } else {
        comment.likes.push(userId);
        isLiked = true;
      }

      await comment.save();

      return {
        status: 200,
        data: {
          success: true,
          message: isLiked ? "Đã thích bình luận" : "Đã hủy thích bình luận",
          likes: comment.likes,
          likesCount: comment.likes.length,
        },
      };
    } catch (error) {
      console.error("Lỗi khi thích bình luận:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  async deleteComment(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy bình luận" },
        };
      }

      if (comment.user.toString() !== userId.toString()) {
        return {
          status: 403,
          data: { success: false, message: "Bạn không có quyền xóa bình luận này" },
        };
      }

      comment.isDelete = true;
      comment.deletedAt = new Date();
      await comment.save();

      // Decrement replies count of parent comment if this was a reply
      if (comment.parentComment) {
        await Comment.findByIdAndUpdate(comment.parentComment, {
          $inc: { replies_count: -1 },
        });
      }

      return {
        status: 200,
        data: {
          success: true,
          message: "Xóa bình luận thành công",
        },
      };
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }
}

export default new CommentService();
