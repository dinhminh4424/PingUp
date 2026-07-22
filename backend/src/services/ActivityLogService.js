import UserActivityLog from "../models/UserActivityLog.js";
import User from "../models/User.js";

class ActivityLogService {
  async log({ userId, action, entityType, entityId, details = {}, req }) {
    try {
      let ipAddress = "";
      let userAgent = "";

      if (req) {
        ipAddress = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "";
        userAgent = req.headers["user-agent"] || "";
      }

      // Lưu log bất đồng bộ
      await UserActivityLog.create({
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error("Lỗi khi ghi nhật ký hoạt động:", error);
    }
  }

  async getUserLogs(userId, page = 1, limit = 15, actionFilter = "") {
    try {
      const skip = (page - 1) * limit;
      const query = { userId };

      if (actionFilter && actionFilter !== "all") {
        query.action = actionFilter;
      }

      const logs = await UserActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await UserActivityLog.countDocuments(query);

      return {
        success: true,
        logs,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalLogs: total,
          limit,
        },
      };
    } catch (error) {
      console.error("Lỗi khi lấy nhật ký hoạt động:", error);
      throw error;
    }
  }

  async getAllLogs(page = 1, limit = 20, actionFilter = "", searchQuery = "") {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      const auditActions = [
        "LOCK_ACCOUNT",
        "UNLOCK_ACCOUNT",
        "PROMOTE_ADMIN",
        "DEMOTE_USER",
        "LOGIN_FAILED",
      ];

      if (actionFilter && actionFilter !== "all") {
        query.action = actionFilter;
      } else {
        // Mặc định chỉ lấy các hành động kiểm toán cấp hệ thống
        query.action = { $in: auditActions };
      }

      if (searchQuery) {
        // Tìm các user khớp với searchQuery trước
        const users = await User.find({
          $or: [
            { full_name: { $regex: searchQuery, $options: "i" } },
            { username: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
          ],
        }).select("_id");

        const userIds = users.map((u) => u._id);
        query.userId = { $in: userIds };
      }

      const logs = await UserActivityLog.find(query)
        .populate("userId", "full_name username profile_picture email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await UserActivityLog.countDocuments(query);

      return {
        success: true,
        logs,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalLogs: total,
          limit,
        },
      };
    } catch (error) {
      console.error("Lỗi khi lấy nhật ký hoạt động hệ thống:", error);
      throw error;
    }
  }

  async getLogStats() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailyStats = await UserActivityLog.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const actionStats = await UserActivityLog.aggregate([
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const topUsers = await UserActivityLog.aggregate([
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            count: 1,
            "userInfo.full_name": 1,
            "userInfo.username": 1,
            "userInfo.email": 1,
            "userInfo.profile_picture": 1,
            "userInfo._id": 1,
          },
        },
      ]);

      return {
        success: true,
        dailyStats,
        actionStats,
        topUsers,
      };
    } catch (error) {
      console.error("Lỗi khi lấy thống kê log:", error);
      throw error;
    }
  }

  async getSuspiciousActivities() {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

      const alerts = [];

      // 1. Quét brute-force (5+ đăng nhập lỗi trong 10 phút)
      const bruteForceAlerts = await UserActivityLog.aggregate([
        {
          $match: {
            action: "LOGIN_FAILED",
            createdAt: { $gte: tenMinutesAgo },
          },
        },
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
            ipList: { $addToSet: "$ipAddress" },
            emails: { $addToSet: "$details.emailAttempted" },
          },
        },
        { $match: { count: { $gte: 5 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      ]);

      bruteForceAlerts.forEach((alert) => {
        alerts.push({
          _id: `bf-${alert._id || "unknown"}-${Date.now()}`,
          type: "SECURITY",
          severity: "HIGH",
          title: "Nghi vấn tấn công Brute-force",
          description: `Tài khoản ${
            alert.userInfo
              ? `${alert.userInfo.full_name} (@${alert.userInfo.username})`
              : alert.emails.join(", ")
          } bị đăng nhập thất bại liên tiếp ${alert.count} lần trong 10 phút.`,
          user: alert.userInfo || { email: alert.emails[0] },
          metadata: { count: alert.count, ips: alert.ipList },
          createdAt: new Date(),
        });
      });

      // 2. Quét spam hoạt động (30+ hành động trong 1 phút)
      const spamAlerts = await UserActivityLog.aggregate([
        {
          $match: {
            createdAt: { $gte: oneMinuteAgo },
          },
        },
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
            actions: { $addToSet: "$action" },
          },
        },
        { $match: { count: { $gte: 30 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
      ]);

      spamAlerts.forEach((alert) => {
        alerts.push({
          _id: `spam-${alert.userInfo._id}-${Date.now()}`,
          type: "SPAM",
          severity: "MEDIUM",
          title: "Hoạt động quá nhanh (Spam)",
          description: `Tài khoản ${alert.userInfo.full_name} (@${alert.userInfo.username}) phát sinh ${alert.count} hành động trong vòng 60 giây.`,
          user: alert.userInfo,
          metadata: { count: alert.count, actions: alert.actions },
          createdAt: new Date(),
        });
      });

      return {
        success: true,
        alerts,
      };
    } catch (error) {
      console.error("Lỗi khi phân tích hoạt động bất thường:", error);
      throw error;
    }
  }
}

export default new ActivityLogService();
