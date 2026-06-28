import User from "../models/User.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";

class PostService {
  async getUserById(id) {
    try {
      const user = await User.findOne({
        _id: id,
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy User by id thành công: " + id,
          user: user,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống Lấy User by id: " + error.message,
        },
      };
    }
  }
}

export default new PostService();
