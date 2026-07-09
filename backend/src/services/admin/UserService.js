import User from "../../models/User.js";

class UserService {
  async getUsers() {
    try {
      const users = await User.find();

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy Users thành công !!!!!",
          users: users,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống Lấy Users: ", error);

      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống Lấy Users: " + error.message,
        },
      };
    }
  }
}

export default new UserService();
