import User from "../../models/User.js";
import Post from "../../models/Post.js";
import Report from "../../models/Report.js";
import Comment from "../../models/Comment.js";
import Conversation from "../../models/Conversation.js";
import mongoose from "mongoose";

class ReportService {
  // Get all posts for admin panel with search, status filters, date range, and pagination
  async getReportPosts(
    searchQuery,
    statusFilter,
    startDate,
    endDate,
    page = 1,
    reasonFilter,
    reporterFilter,
  ) {
    try {
      const limit = 10;
      const pageNumber = Math.max(1, parseInt(page) || 1);
      const skip = (pageNumber - 1) * limit;

      let query = { targetType: "post" };

      // 1. Filter by status
      if (statusFilter && statusFilter !== "all") {
        query.status = statusFilter;
      }

      // 1.1. Filter by reason
      if (reasonFilter && reasonFilter !== "all") {
        query.reason = reasonFilter;
      }

      // 1.2. Filter by reporter
      if (reporterFilter) {
        const matchedReporters = await User.find({
          $or: [
            { full_name: { $regex: reporterFilter, $options: "i" } },
            { username: { $regex: reporterFilter, $options: "i" } },
          ],
        }).select("_id");
        const reporterIds = matchedReporters.map((r) => r._id);
        query.reporterId = { $in: reporterIds };
      }

      // 2. Filter by date range (startDate, endDate)
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      // 3. Filter by searchQuery (Report ID, reporter name/username, post content, post author name/username, report reason/details)
      if (searchQuery) {
        const isObjectId = mongoose.isValidObjectId(searchQuery);

        if (isObjectId) {
          query.$or = [
            { _id: searchQuery },
            { targetId: searchQuery }
          ];
        } else {
          // Find users whose name or username matches search query
          const matchedUsers = await User.find({
            $or: [
              { full_name: { $regex: searchQuery, $options: "i" } },
              { username: { $regex: searchQuery, $options: "i" } },
            ],
          }).select("_id");
          const userIds = matchedUsers.map((u) => u._id);

          // Find posts matching search query or author
          const matchedPosts = await Post.find({
            $or: [
              { content: { $regex: searchQuery, $options: "i" } },
              { user: { $in: userIds } },
            ],
          }).select("_id");
          const postIds = matchedPosts.map((p) => p._id);

          query.$or = [
            { reporterId: { $in: userIds } },
            { targetId: { $in: postIds } },
            { reason: { $regex: searchQuery, $options: "i" } },
            { details: { $regex: searchQuery, $options: "i" } },
          ];
        }
      }

      const totalReports = await Report.countDocuments(query);
      const totalPages = Math.ceil(totalReports / limit);

      // Query reports
      const reportPosts = await Report.find(query)
        .populate("reporterId", "_id username full_name profile_picture email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Populate targeted post details manually
      const populatedReports = await Promise.all(
        reportPosts.map(async (report) => {
          const targetPost = await Post.findById(report.targetId)
            .populate("user", "_id username full_name profile_picture email")
            .select("content image_urls user isActive isDelete createdAt");
          return {
            ...report.toObject(),
            post: targetPost,
          };
        }),
      );

      // Overall stats for reported posts
      const totalReportsAll = await Report.countDocuments({ targetType: "post" });
      const pendingCount = await Report.countDocuments({ targetType: "post", status: "pending" });
      const resolvedCount = await Report.countDocuments({ targetType: "post", status: "resolved" });
      const dismissedCount = await Report.countDocuments({ targetType: "post", status: "dismissed" });

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách Report Post thành công!",
          reportPosts: populatedReports,
          pagination: {
            currentPage: pageNumber,
            totalPages: totalPages || 1,
            totalReports: totalReports,
            limit,
          },
          stats: {
            total: totalReportsAll,
            pending: pendingCount,
            resolved: resolvedCount,
            dismissed: dismissedCount,
          }
        },
      };
    } catch (error) {
      console.error(
        "Lỗi hệ thống lấy danh sách báo cáo bài viết admin: ",
        error,
      );
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống: " + error.message,
        },
      };
    }
  }

  // Update report status (pending, resolved, dismissed)
  async updateReportStatus(id, status) {
    try {
      if (!["pending", "resolved", "dismissed"].includes(status)) {
        return {
          status: 400,
          data: {
            success: false,
            message: "Trạng thái không hợp lệ",
          },
        };
      }

      const report = await Report.findById(id);
      if (!report) {
        return {
          status: 404,
          data: {
            success: false,
            message: "Không tìm thấy báo cáo",
          },
        };
      }

      report.status = status;
      await report.save();

      return {
        status: 200,
        data: {
          success: true,
          message: "Cập nhật trạng thái báo cáo thành công!",
          report,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống cập nhật trạng thái báo cáo: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống: " + error.message,
        },
      };
    }
  }

  // Get all comments for admin panel with search, status filters, date range, and pagination
  async getReportComments(
    searchQuery,
    statusFilter,
    startDate,
    endDate,
    page = 1,
    reasonFilter,
    reporterFilter,
  ) {
    try {
      const limit = 10;
      const pageNumber = Math.max(1, parseInt(page) || 1);
      const skip = (pageNumber - 1) * limit;

      let query = { targetType: "comment" };

      // 1. Filter by status
      if (statusFilter && statusFilter !== "all") {
        query.status = statusFilter;
      }

      // 1.1. Filter by reason
      if (reasonFilter && reasonFilter !== "all") {
        query.reason = reasonFilter;
      }

      // 1.2. Filter by reporter
      if (reporterFilter) {
        const matchedReporters = await User.find({
          $or: [
            { full_name: { $regex: reporterFilter, $options: "i" } },
            { username: { $regex: reporterFilter, $options: "i" } },
          ],
        }).select("_id");
        const reporterIds = matchedReporters.map((r) => r._id);
        query.reporterId = { $in: reporterIds };
      }

      // 2. Filter by date range (startDate, endDate)
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      // 3. Filter by searchQuery (Report ID, reporter name/username, comment content, comment author name/username, report reason/details)
      if (searchQuery) {
        const isObjectId = mongoose.isValidObjectId(searchQuery);

        if (isObjectId) {
          query.$or = [
            { _id: searchQuery },
            { targetId: searchQuery }
          ];
        } else {
          // Find users whose name or username matches search query
          const matchedUsers = await User.find({
            $or: [
              { full_name: { $regex: searchQuery, $options: "i" } },
              { username: { $regex: searchQuery, $options: "i" } },
            ],
          }).select("_id");
          const userIds = matchedUsers.map((u) => u._id);

          // Find comments matching search query or author
          const matchedComments = await Comment.find({
            $or: [
              { content: { $regex: searchQuery, $options: "i" } },
              { user: { $in: userIds } },
            ],
          }).select("_id");
          const commentIds = matchedComments.map((c) => c._id);

          query.$or = [
            { reporterId: { $in: userIds } },
            { targetId: { $in: commentIds } },
            { reason: { $regex: searchQuery, $options: "i" } },
            { details: { $regex: searchQuery, $options: "i" } },
          ];
        }
      }

      const totalReports = await Report.countDocuments(query);
      const totalPages = Math.ceil(totalReports / limit);

      // Query reports
      const reportComments = await Report.find(query)
        .populate("reporterId", "_id username full_name profile_picture email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Populate targeted comment details manually
      const populatedReports = await Promise.all(
        reportComments.map(async (report) => {
          const targetComment = await Comment.findById(report.targetId)
            .populate("user", "_id username full_name profile_picture email")
            .populate({
              path: "post",
              populate: { path: "user", select: "_id username full_name profile_picture" }
            })
            .select("content image_urls user isActive isDelete createdAt post");
          return {
            ...report.toObject(),
            comment: targetComment,
          };
        }),
      );

      // Overall stats for reported comments
      const totalReportsAll = await Report.countDocuments({ targetType: "comment" });
      const pendingCount = await Report.countDocuments({ targetType: "comment", status: "pending" });
      const resolvedCount = await Report.countDocuments({ targetType: "comment", status: "resolved" });
      const dismissedCount = await Report.countDocuments({ targetType: "comment", status: "dismissed" });

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách Report Comment thành công!",
          reportComments: populatedReports,
          pagination: {
            currentPage: pageNumber,
            totalPages: totalPages || 1,
            totalReports: totalReports,
            limit,
          },
          stats: {
            total: totalReportsAll,
            pending: pendingCount,
            resolved: resolvedCount,
            dismissed: dismissedCount,
          }
        },
      };
    } catch (error) {
      console.error(
        "Lỗi hệ thống lấy danh sách báo cáo bình luận admin: ",
        error,
      );
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống: " + error.message,
        },
      };
    }
  }

  async getReportConversations(
    searchQuery,
    statusFilter,
    startDate,
    endDate,
    page = 1,
    reasonFilter,
    reporterFilter,
  ) {
    try {
      const limit = 10;
      const pageNumber = Math.max(1, parseInt(page) || 1);
      const skip = (pageNumber - 1) * limit;

      let query = { targetType: "group" };

      if (statusFilter && statusFilter !== "all") {
        query.status = statusFilter;
      }

      if (reasonFilter && reasonFilter !== "all") {
        query.reason = reasonFilter;
      }

      if (reporterFilter) {
        const matchedReporters = await User.find({
          $or: [
            { full_name: { $regex: reporterFilter, $options: "i" } },
            { username: { $regex: reporterFilter, $options: "i" } },
          ],
        }).select("_id");
        const reporterIds = matchedReporters.map((r) => r._id);
        query.reporterId = { $in: reporterIds };
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      if (searchQuery) {
        const isObjectId = mongoose.isValidObjectId(searchQuery);

        if (isObjectId) {
          query.$or = [
            { _id: searchQuery },
            { targetId: searchQuery }
          ];
        } else {
          const matchedUsers = await User.find({
            $or: [
              { full_name: { $regex: searchQuery, $options: "i" } },
              { username: { $regex: searchQuery, $options: "i" } },
            ],
          }).select("_id");
          const userIds = matchedUsers.map((u) => u._id);

          const matchedConvs = await Conversation.find({
            "group.name": { $regex: searchQuery, $options: "i" }
          }).select("_id");
          const convIds = matchedConvs.map((c) => c._id);

          query.$or = [
            { reporterId: { $in: userIds } },
            { targetId: { $in: convIds } },
            { reason: { $regex: searchQuery, $options: "i" } },
            { details: { $regex: searchQuery, $options: "i" } },
          ];
        }
      }

      const totalReports = await Report.countDocuments(query);
      const totalPages = Math.ceil(totalReports / limit);

      const reportConversations = await Report.find(query)
        .populate("reporterId", "_id username full_name profile_picture email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const populatedReports = await Promise.all(
        reportConversations.map(async (report) => {
          const targetConv = await Conversation.findById(report.targetId)
            .populate("participants.userId", "_id username full_name profile_picture email")
            .select("type participants group isActive isDelete createdAt");
          return {
            ...report.toObject(),
            conversation: targetConv,
          };
        }),
      );

      const totalReportsAll = await Report.countDocuments({ targetType: "group" });
      const pendingCount = await Report.countDocuments({ targetType: "group", status: "pending" });
      const resolvedCount = await Report.countDocuments({ targetType: "group", status: "resolved" });
      const dismissedCount = await Report.countDocuments({ targetType: "group", status: "dismissed" });

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách Report Conversation thành công!",
          reportConversations: populatedReports,
          pagination: {
            currentPage: pageNumber,
            totalPages: totalPages || 1,
            totalReports: totalReports,
            limit,
          },
          stats: {
            total: totalReportsAll,
            pending: pendingCount,
            resolved: resolvedCount,
            dismissed: dismissedCount,
          }
        },
      };
    } catch (error) {
      console.error(
        "Lỗi hệ thống lấy danh sách báo cáo hộp thoại admin: ",
        error,
      );
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

export default new ReportService();
