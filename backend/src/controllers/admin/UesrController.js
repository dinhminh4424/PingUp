import UserService from "../../services/admin/UserService.js";

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
}
export default new UserController();
