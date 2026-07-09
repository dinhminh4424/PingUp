import UserService from "../../services/admin/UserService.js";

class UserController {
  async getUsers(req, res) {
    try {
      const result = await UserService.getUsers();
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi danh sách users: ", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi danh sách users: " + error.message,
      });
    }
  }
}
export default new UserController();
