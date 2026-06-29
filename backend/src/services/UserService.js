import User from "../models/User.js";
import Follow from "../models/Follow.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";

class UserService {
  async getUserById(id) {
    try {
      const user = await User.findOne({
        _id: id,
      });

      if (!user) {
        return {
          status: 404,
          data: {
            success: false,
            message: "Không tìm thấy người dùng",
          },
        };
      }

      const followersCount = await Follow.countDocuments({ following: id });
      const followingCount = await Follow.countDocuments({ follower: id });

      const userObj = user.toObject();
      userObj.followersCount = followersCount;
      userObj.followingCount = followingCount;

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy User by id thành công: " + id,
          user: userObj,
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

  async updateInfoUser(
    id,
    username,
    full_name,
    bio,
    location,
    profile_picture,
    cover_photo,
  ) {
    try {
      const data = {};

      if (username !== undefined) data.username = username;
      if (full_name !== undefined) data.full_name = full_name;
      if (bio !== undefined) data.bio = bio;
      if (location !== undefined) data.location = location;

      if (profile_picture) {
        const uploadResult = await uploadImageFromBuffer(
          profile_picture.buffer,
        );

        data.profile_picture = uploadResult.secure_url;
      }

      if (cover_photo) {
        const uploadResult = await uploadImageFromBuffer(cover_photo.buffer);

        data.cover_photo = uploadResult.secure_url;
      }

      const user = await User.findByIdAndUpdate(id, data, { returnDocument: "after" });

      console.log("User: ", user);

      return {
        status: 200,
        data: {
          success: true,
          message: `Cạp nhật thông tin user id: ${id}  thành công! `,
          user: user,
        },
      };
    } catch (error) {
      console.log("Lỗi khi chỉnh sửa thông tin user updateInfoUser: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message:
            "Lỗi khi chỉnh sửa thông tin user updateInfoUser: " + error.message,
        },
      };
    }
  }
}

export default new UserService();
