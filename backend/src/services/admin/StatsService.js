import User from "../../models/User.js";
import Post from "../../models/Post.js";
import Story from "../../models/Story.js";
import Message from "../../models/Message.js";
import Comment from "../../models/Comment.js";
import Conversation from "../../models/Conversation.js";
import Report from "../../models/Report.js";
import Connection from "../../models/Connection.js";
import { onlineUsers } from "../../socket/index.js";

class StatsService {
  // 1. GET OVERVIEW STATS (Core dashboard counts - light and fast)
  async getOverviewStats() {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const totalUsers = await User.countDocuments({});
      const onlineUsersCount = onlineUsers ? onlineUsers.size : 0;
      
      const totalPosts = await Post.countDocuments({ isDelete: false });
      const postsToday = await Post.countDocuments({ isDelete: false, createdAt: { $gte: startOfToday } });
      
      const totalMessages = await Message.countDocuments({});
      const messagesToday = await Message.countDocuments({ createdAt: { $gte: startOfToday } });

      const likesAggregation = await Post.aggregate([
        { $match: { isDelete: false } },
        { $project: { likesCount: { $size: { $ifNull: ["$likes_count", []] } } } },
        { $group: { _id: null, total: { $sum: "$likesCount" } } }
      ]);
      const totalLikes = likesAggregation[0]?.total || 0;

      const totalStories = await Story.countDocuments({ isDelete: false });

      // Top users (Limit to top 5)
      const topPosters = await Post.aggregate([
        { $match: { isDelete: false } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userInfo" } },
        { $unwind: "$userInfo" },
        { $project: { _id: 1, count: 1, "userInfo.full_name": 1, "userInfo.username": 1, "userInfo.profile_picture": 1 } }
      ]);

      const topLiked = await Post.aggregate([
        { $match: { isDelete: false } },
        { $project: { user: 1, likesCount: { $size: { $ifNull: ["$likes_count", []] } } } },
        { $group: { _id: "$user", count: { $sum: "$likesCount" } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userInfo" } },
        { $unwind: "$userInfo" },
        { $project: { _id: 1, count: 1, "userInfo.full_name": 1, "userInfo.username": 1, "userInfo.profile_picture": 1 } }
      ]);

      return {
        status: 200,
        data: {
          success: true,
          stats: {
            totalUsers,
            onlineUsers: onlineUsersCount,
            totalPosts,
            postsToday,
            totalMessages,
            messagesToday,
            totalLikes,
            totalStories
          },
          leaderboards: {
            topPosters,
            topLiked
          }
        }
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy overview stats: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }

  // 2. GET USER STATS (Detailed stats and charts with period filter)
  async getUserStats(period = "7days", role = "all", status = "all", startDate = null, endDate = null) {
    console.log("getUserStats called with period:", period, "role:", role, "status:", status, "startDate:", startDate, "endDate:", endDate);
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Build filter query
      let filter = {};
      if (role && role !== "all") {
        filter.role = role;
      }
      if (status && status !== "all") {
        filter.isActive = status === "active";
      }

      // Check for custom date range
      let isCustom = false;
      let customStart = null;
      let customEnd = null;
      if (startDate && endDate) {
        isCustom = true;
        customStart = new Date(startDate);
        customEnd = new Date(endDate);
        customEnd.setHours(23, 59, 59, 999);
        filter.createdAt = { $gte: customStart, $lte: customEnd };
      }

      const totalUsers = await User.countDocuments(filter);
      const activeUsers = await User.countDocuments({ ...filter, isActive: true });
      const blockedUsers = await User.countDocuments({ ...filter, isActive: false });
      const onlineUsersCount = onlineUsers ? onlineUsers.size : 0;

      const newUsersToday = isCustom ? 0 : await User.countDocuments({ ...filter, createdAt: { $gte: startOfToday } });
      const newUsersThisWeek = isCustom ? 0 : await User.countDocuments({ ...filter, createdAt: { $gte: startOfWeek } });
      const newUsersThisMonth = isCustom ? 0 : await User.countDocuments({ ...filter, createdAt: { $gte: startOfMonth } });
      const verifiedUsers = 0; // default 0 since schema doesn't have verified yet

      // Build registration chart depending on period
      let registrationChart = [];
      const getChartCount = async (start, end) => {
        // Temp query object without overriding filter.createdAt if custom
        const query = { ...filter, createdAt: { $gte: start, $lte: end } };
        return await User.countDocuments(query);
      };

      if (isCustom) {
        const diffTime = Math.abs(customEnd - customStart);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysCount = Math.min(diffDays, 90); // Cap at 90 days

        for (let i = 0; i <= daysCount; i++) {
          const d = new Date(customStart.getTime() + i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
          const count = await getChartCount(dayStart, dayEnd);
          registrationChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
            count
          });
        }
      } else if (period === "12months") {
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setMonth(now.getMonth() - i);
          const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
          const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
          const count = await getChartCount(monthStart, monthEnd);
          registrationChart.push({
            date: monthStart.toLocaleDateString("vi-VN", { month: "short", year: "numeric" }),
            count
          });
        }
      } else if (period === "30days") {
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
          const count = await getChartCount(dayStart, dayEnd);
          registrationChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
            count
          });
        }
      } else {
        // default 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
          const count = await getChartCount(dayStart, dayEnd);
          registrationChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" }),
            count
          });
        }
      }

      const totalConnections = await Connection.countDocuments({});
      const avgConnections = totalUsers > 0 ? Number(((totalConnections * 2) / totalUsers).toFixed(1)) : 0;

      return {
        status: 200,
        data: {
          success: true,
          totalUsers,
          activeUsers,
          blockedUsers,
          onlineUsers: onlineUsersCount,
          newUsersToday,
          newUsersThisWeek,
          newUsersThisMonth,
          verifiedUsers,
          connections: {
            totalConnections,
            avgConnections
          },
          chart: registrationChart
        }
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy user stats: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }

  // 3. GET POST & CONTENT STATS (Posts, Comments)
  async getPostStats(period = "7days", postType = "all", startDate = null, endDate = null) {
    console.log("getPostStats called with period:", period, "postType:", postType, "startDate:", startDate, "endDate:", endDate);
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let filter = { isDelete: false };
      if (postType && postType !== "all") {
        filter.post_type = postType;
      }

      // Check for custom date range
      let isCustom = false;
      let customStart = null;
      let customEnd = null;
      if (startDate && endDate) {
        isCustom = true;
        customStart = new Date(startDate);
        customEnd = new Date(endDate);
        customEnd.setHours(23, 59, 59, 999);
        filter.createdAt = { $gte: customStart, $lte: customEnd };
      }

      const totalPosts = await Post.countDocuments(filter);
      const postsToday = isCustom ? 0 : await Post.countDocuments({ ...filter, createdAt: { $gte: startOfToday } });
      
      const likesAggregation = await Post.aggregate([
        { $match: filter },
        { $project: { likesCount: { $size: { $ifNull: ["$likes_count", []] } } } },
        { $group: { _id: null, total: { $sum: "$likesCount" } } }
      ]);
      const totalLikes = likesAggregation[0]?.total || 0;

      // Comments filter
      let commentFilter = { isDelete: false };
      if (isCustom) {
        commentFilter.createdAt = { $gte: customStart, $lte: customEnd };
      }
      const totalComments = await Comment.countDocuments(commentFilter);
      
      const sharesAggregation = await Post.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$shares_count", 0] } } } }
      ]);
      const totalShares = sharesAggregation[0]?.total || 0;

      const deletedOrHiddenPosts = await Post.countDocuments({ 
        $or: [{ isDelete: true }, { isActive: false }] 
      });

      const commentLikesAggregation = await Comment.aggregate([
        { $match: commentFilter },
        { $project: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $group: { _id: null, total: { $sum: "$likesCount" } } }
      ]);
      const totalCommentLikes = commentLikesAggregation[0]?.total || 0;

      // Build daily activity chart depending on period (7days or 30days)
      let activityChart = [];
      const getPostsCount = async (start, end) => {
        const query = { ...filter, createdAt: { $gte: start, $lte: end } };
        return await Post.countDocuments(query);
      };
      const getCommentsCount = async (start, end) => {
        return await Comment.countDocuments({ ...commentFilter, createdAt: { $gte: start, $lte: end } });
      };

      if (isCustom) {
        const diffTime = Math.abs(customEnd - customStart);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysCount = Math.min(diffDays, 90); // Cap at 90 days

        for (let i = 0; i <= daysCount; i++) {
          const d = new Date(customStart.getTime() + i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

          const posts = await getPostsCount(dayStart, dayEnd);
          const comments = await getCommentsCount(dayStart, dayEnd);

          activityChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
            posts,
            comments
          });
        }
      } else {
        const daysCount = period === "30days" ? 30 : 7;
        for (let i = daysCount - 1; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

          const posts = await getPostsCount(dayStart, dayEnd);
          const comments = await getCommentsCount(dayStart, dayEnd);

          activityChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
            posts,
            comments
          });
        }
      }

      // Top 5 posts by likes
      const topPosts = await Post.aggregate([
        { $match: filter },
        { 
          $project: { 
            content: 1, 
            likesCount: { $size: { $ifNull: ["$likes_count", []] } },
            user: 1,
            createdAt: 1
          } 
        },
        { $sort: { likesCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userInfo" } },
        { $unwind: "$userInfo" },
        { $project: { content: 1, likesCount: 1, createdAt: 1, "userInfo.full_name": 1, "userInfo.username": 1, "userInfo.profile_picture": 1 } }
      ]);

      // Top 5 posts by comments count
      const topCommentedPosts = await Comment.aggregate([
        { $match: { isDelete: false } },
        { $group: { _id: "$post", commentCount: { $sum: 1 } } },
        { $sort: { commentCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: "posts", localField: "_id", foreignField: "_id", as: "postInfo" } },
        { $unwind: "$postInfo" },
        { $match: { "postInfo.isDelete": false } },
        { $lookup: { from: "users", localField: "postInfo.user", foreignField: "_id", as: "userInfo" } },
        { $unwind: "$userInfo" },
        { $project: { _id: 1, commentCount: 1, "postInfo.content": 1, "postInfo.createdAt": 1, "userInfo.full_name": 1, "userInfo.username": 1, "userInfo.profile_picture": 1 } }
      ]);

      // Top 5 posts by shares count
      const topSharedPosts = await Post.aggregate([
        { $match: filter },
        { $sort: { shares_count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userInfo" } },
        { $unwind: "$userInfo" },
        { $project: { content: 1, shares_count: 1, createdAt: 1, "userInfo.full_name": 1, "userInfo.username": 1, "userInfo.profile_picture": 1 } }
      ]);

      // Breakdown of post_type
      const postTypesBreakdown = await Post.aggregate([
        { $match: filter },
        { $group: { _id: "$post_type", count: { $sum: 1 } } }
      ]);

      return {
        status: 200,
        data: {
          success: true,
          posts: {
            totalPosts,
            postsToday,
            totalLikes,
            totalComments,
            totalShares,
            deletedOrHiddenPosts
          },
          comments: {
            totalComments,
            totalCommentLikes
          },
          chart: activityChart,
          leaderboards: {
            topPosts,
            topCommentedPosts,
            topSharedPosts,
            postTypesBreakdown
          }
        }
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy post stats: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }

  // 3.5 GET MESSAGE STATS (Chat, Messages)
  async getMessageStats(period = "7days", startDate = null, endDate = null) {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let filter = {};
      let isCustom = false;
      let customStart = null;
      let customEnd = null;
      if (startDate && endDate) {
        isCustom = true;
        customStart = new Date(startDate);
        customEnd = new Date(endDate);
        customEnd.setHours(23, 59, 59, 999);
        filter.createdAt = { $gte: customStart, $lte: customEnd };
      }

      const totalMessages = await Message.countDocuments(filter);
      const messagesToday = isCustom ? 0 : await Message.countDocuments({ ...filter, createdAt: { $gte: startOfToday } });
      const activeConversations = await Conversation.countDocuments(isCustom ? { createdAt: { $gte: customStart, $lte: customEnd } } : {});

      const msgReactionsAggregation = await Message.aggregate([
        { $match: filter },
        { $project: { reactionsCount: { $size: { $ifNull: ["$reactions", []] } } } },
        { $group: { _id: null, total: { $sum: "$reactionsCount" } } }
      ]);
      const totalReactions = msgReactionsAggregation[0]?.total || 0;

      // Build daily messages volume chart
      let messageChart = [];
      const getMessagesCount = async (start, end) => {
        return await Message.countDocuments({ ...filter, createdAt: { $gte: start, $lte: end } });
      };

      if (isCustom) {
        const diffTime = Math.abs(customEnd - customStart);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysCount = Math.min(diffDays, 90);

        for (let i = 0; i <= daysCount; i++) {
          const d = new Date(customStart.getTime() + i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
          const count = await getMessagesCount(dayStart, dayEnd);
          messageChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
            count
          });
        }
      } else {
        const daysCount = period === "30days" ? 30 : 7;
        for (let i = daysCount - 1; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
          const count = await getMessagesCount(dayStart, dayEnd);
          messageChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
            count
          });
        }
      }

      // Top chatters (senderId count)
      const topChatters = await Message.aggregate([
        { $match: filter },
        { $group: { _id: "$senderId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userInfo" } },
        { $unwind: "$userInfo" },
        { $project: { _id: 1, count: 1, "userInfo.full_name": 1, "userInfo.username": 1, "userInfo.profile_picture": 1 } }
      ]);

      // Top message reactions
      const topReactions = await Message.aggregate([
        { $match: filter },
        { $unwind: "$reactions" },
        { $group: { _id: "$reactions.emoji", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      return {
        status: 200,
        data: {
          success: true,
          summary: {
            totalMessages,
            messagesToday,
            activeConversations,
            totalReactions
          },
          chart: messageChart,
          leaderboards: {
            topChatters,
            topReactions
          }
        }
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy message stats: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }

  // 4. SEED MOCK REPORTS
  async seedMockReports() {
    try {
      const reportCount = await Report.countDocuments({});
      if (reportCount > 0) return;
      
      console.log("Seeding mock reports...");
      const users = await User.find({}).limit(5);
      const posts = await Post.find({}).limit(5);
      const comments = await Comment.find({}).limit(5);
      
      if (users.length === 0) return;
      
      const reporter = users[0]._id;
      const reasons = ["Spam", "Hate speech", "Harassment", "Violence", "Other"];
      const statuses = ["pending", "resolved", "dismissed"];
      const targetTypes = ["post", "comment", "user"];
      
      const mockReports = [];
      const now = new Date();
      
      for (let i = 0; i < 30; i++) {
        const dayOffset = Math.floor(Math.random() * 10);
        const createdAt = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
        
        let targetId = reporter;
        const targetType = targetTypes[i % targetTypes.length];
        if (targetType === "post" && posts.length > 0) {
          targetId = posts[i % posts.length]._id;
        } else if (targetType === "comment" && comments.length > 0) {
          targetId = comments[i % comments.length]._id;
        } else if (targetType === "user" && users.length > 1) {
          targetId = users[1]._id;
        }
        
        mockReports.push({
          reporterId: reporter,
          targetId,
          targetType,
          reason: reasons[i % reasons.length],
          status: statuses[i % statuses.length],
          createdAt,
          updatedAt: createdAt
        });
      }
      
      await Report.insertMany(mockReports);
      console.log("Mock reports seeded successfully!");
    } catch (e) {
      console.error("Lỗi seed mock reports: ", e);
    }
  }

  // 5. GET REPORT STATS
  async getReportStats(period = "7days", targetType = "all", status = "all", startDate = null, endDate = null) {
    await this.seedMockReports();
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let filter = {};
      if (targetType && targetType !== "all") {
        filter.targetType = targetType;
      }
      if (status && status !== "all") {
        filter.status = status;
      }

      // Check for custom date range
      let isCustom = false;
      let customStart = null;
      let customEnd = null;
      if (startDate && endDate) {
        isCustom = true;
        customStart = new Date(startDate);
        customEnd = new Date(endDate);
        customEnd.setHours(23, 59, 59, 999);
        filter.createdAt = { $gte: customStart, $lte: customEnd };
      }

      const totalReports = await Report.countDocuments(filter);
      const pendingReports = await Report.countDocuments({ ...filter, status: "pending" });
      const resolvedReports = await Report.countDocuments({ ...filter, status: "resolved" });
      const dismissedReports = await Report.countDocuments({ ...filter, status: "dismissed" });

      const newReportsToday = isCustom ? 0 : await Report.countDocuments({ ...filter, createdAt: { $gte: startOfToday } });

      // Daily reports chart
      let reportChart = [];
      const getReportCount = async (start, end) => {
        const query = { ...filter, createdAt: { $gte: start, $lte: end } };
        return await Report.countDocuments(query);
      };

      if (isCustom) {
        const diffTime = Math.abs(customEnd - customStart);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysCount = Math.min(diffDays, 90);

        for (let i = 0; i <= daysCount; i++) {
          const d = new Date(customStart.getTime() + i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
          const count = await getReportCount(dayStart, dayEnd);
          reportChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
            count
          });
        }
      } else {
        const daysCount = period === "30days" ? 30 : 7;
        for (let i = daysCount - 1; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
          const count = await getReportCount(dayStart, dayEnd);
          reportChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
            count
          });
        }
      }

      // Top reported reasons
      const topReasons = await Report.aggregate([
        { $match: filter },
        { $group: { _id: "$reason", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Recent reports list with lookup to reporter
      const recentReports = await Report.find(filter)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("reporterId", "full_name username profile_picture");

      return {
        status: 200,
        data: {
          success: true,
          summary: {
            totalReports,
            pendingReports,
            resolvedReports,
            dismissedReports,
            newReportsToday
          },
          chart: reportChart,
          leaderboards: {
            topReasons
          },
          recentReports
        }
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy report stats: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }

  // 6. GET STORY STATS
  async getStoryStats(period = "7days", storyType = "all", startDate = null, endDate = null) {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let filter = { isDelete: false };
      if (storyType && storyType !== "all") {
        filter.story_type = storyType;
      }

      // Check for custom date range
      let isCustom = false;
      let customStart = null;
      let customEnd = null;
      if (startDate && endDate) {
        isCustom = true;
        customStart = new Date(startDate);
        customEnd = new Date(endDate);
        customEnd.setHours(23, 59, 59, 999);
        filter.createdAt = { $gte: customStart, $lte: customEnd };
      }

      const totalStories = await Story.countDocuments(filter);
      const storiesToday = isCustom ? 0 : await Story.countDocuments({ ...filter, createdAt: { $gte: startOfToday } });
      
      const storyViewsAggregation = await Story.aggregate([
        { $match: filter },
        { $project: { viewersCount: { $size: { $ifNull: ["$viewers", []] } } } },
        { $group: { _id: null, total: { $sum: "$viewersCount" } } }
      ]);
      const totalStoryViews = storyViewsAggregation[0]?.total || 0;

      const storyLikesAggregation = await Story.aggregate([
        { $match: filter },
        { $project: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $group: { _id: null, total: { $sum: "$likesCount" } } }
      ]);
      const totalStoryLikes = storyLikesAggregation[0]?.total || 0;

      // Daily creations chart
      let creationsChart = [];
      const getStoriesCount = async (start, end) => {
        const query = { ...filter, createdAt: { $gte: start, $lte: end } };
        return await Story.countDocuments(query);
      };

      if (isCustom) {
        const diffTime = Math.abs(customEnd - customStart);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysCount = Math.min(diffDays, 90);

        for (let i = 0; i <= daysCount; i++) {
          const d = new Date(customStart.getTime() + i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
          const count = await getStoriesCount(dayStart, dayEnd);
          creationsChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
            count
          });
        }
      } else {
        const daysCount = period === "30days" ? 30 : 7;
        for (let i = daysCount - 1; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
          const count = await getStoriesCount(dayStart, dayEnd);
          creationsChart.push({
            date: dayStart.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
            count
          });
        }
      }

      // Top stories (most viewed)
      const topStories = await Story.aggregate([
        { $match: filter },
        { 
          $project: { 
            content: 1, 
            viewersCount: { $size: { $ifNull: ["$viewers", []] } },
            user: 1,
            createdAt: 1
          } 
        },
        { $sort: { viewersCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userInfo" } },
        { $unwind: "$userInfo" },
        { $project: { content: 1, viewersCount: 1, createdAt: 1, "userInfo.full_name": 1, "userInfo.username": 1, "userInfo.profile_picture": 1 } }
      ]);

      return {
        status: 200,
        data: {
          success: true,
          summary: {
            totalStories,
            storiesToday,
            totalStoryViews,
            totalStoryLikes
          },
          chart: creationsChart,
          leaderboards: {
            topStories
          }
        }
      };
    } catch (error) {
      console.error("Lỗi hệ thống lấy story stats: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }
}

export default new StatsService();
