import UserService from "../services/UserService.js";

class UserController {
  async authMe(req, res) {
    try {
      // console.log("req.user: ", req.user);
      const user = req.user;

      res.status(200).json({
        success: true,
        user: user,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin người dùng: " + error.message,
      });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const result = await UserService.getUserById(id);

      res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng bởi id:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin người dùng bởi id: " + error.message,
      });
    }
  }

  async updateInfoUser(req, res) {
    try {
      const user = req.user;
      const { username, full_name, bio, location } = req.body;

      // Dùng upload.fields() thì sẽ có dạng

      // ============================  req.files; ============================

      // req.files = {
      //   profile_picture: [
      //     {
      //       fieldname: "profile_picture",
      //       originalname: "avatar.jpg",
      //       filename: "...",
      //       ...
      //     }
      //   ],
      //   cover_photo: [
      //     {
      //       fieldname: "cover_photo",
      //       originalname: "cover.jpg",
      //       filename: "...",
      //       ...
      //     }
      //   ]
      // }

      const profile_picture = req.files?.profile_picture?.[0];
      const cover_photo = req.files?.cover_photo?.[0];

      console.log("========= Update ==========");
      console.log("user._id: ", user._id);
      console.log("username: ", username);
      console.log("full_name: ", full_name);
      console.log("bio: ", bio);
      console.log("location: ", location);
      console.log("profile_picture: ", profile_picture);
      console.log("cover_photo: ", cover_photo);

      const result = await UserService.updateInfoUser(
        user._id,
        username,
        full_name,
        bio,
        location,
        profile_picture,
        cover_photo,
      );

      res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa thông tin user updateInfoUser:", error);
      res.status(500).json({
        success: false,
        message:
          "Lỗi khi chỉnh sửa thông tin user updateInfoUser:" + error.message,
      });
    }
  }
}

export default new UserController();
