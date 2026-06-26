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
}

export default new UserController();
