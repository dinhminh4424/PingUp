import UserService from "../../services/admin/UserService.js";
import ActivityLogService from "../../services/ActivityLogService.js";

class UserController {
  async getUsers(req, res) {
    try {
      const { searchQuery, roleFilter, statusFilter, page = 1 } = req.query;
      const result = await UserService.getUsers(
        searchQuery,
        roleFilter,
        statusFilter,
        page,
      );
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi danh sách users: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi danh sách users: " + error.message,
      });
    }
  }

  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.toggleActive(id);

      if (result.status === 200 && result.data?.success && result.data?.user) {
        const targetUser = result.data.user;
        await ActivityLogService.log({
          userId: targetUser._id,
          action: targetUser.isActive ? "UNLOCK_ACCOUNT" : "LOCK_ACCOUNT",
          entityType: "USER",
          entityId: targetUser._id,
          details: { adminId: req.user._id },
          req,
        });
      }

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi toggle active: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi toggle active: " + error.message,
      });
    }
  }

  async toggleRole(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.toggleRole(id);

      if (result.status === 200 && result.data?.success && result.data?.user) {
        const targetUser = result.data.user;
        await ActivityLogService.log({
          userId: targetUser._id,
          action: targetUser.role === "admin" ? "PROMOTE_ADMIN" : "DEMOTE_USER",
          entityType: "USER",
          entityId: targetUser._id,
          details: { adminId: req.user._id },
          req,
        });
      }

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi toggle role: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi toggle role: " + error.message,
      });
    }
  }

  async getUserDetail(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.getUserDetail(id);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết user: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy chi tiết user: " + error.message,
      });
    }
  }

  async getUserLogs(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 15, actionFilter = "" } = req.query;
      const result = await ActivityLogService.getUserLogs(
        id,
        parseInt(page),
        parseInt(limit),
        actionFilter
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi khi lấy nhật ký hoạt động: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy nhật ký hoạt động: " + error.message,
      });
    }
  }
}
export default new UserController();
