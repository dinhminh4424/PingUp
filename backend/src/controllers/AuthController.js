import AuthService from "../services/AuthService.js";

class AuthController {
  async register(req, res) {
    try {
      const { email, username, password, full_name } = req.body;
      console.log("email: ", email);
      console.log("password: ", password);
      console.log("full_name: ", full_name);
      console.log("username: ", username);

      // kiểm tra
      if (!email || !username || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin",
        });
      }

      const result = await AuthService.register(
        email,
        username,
        password,
        full_name,
      );

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi tạo người dùng mới: " + error.message,
      });
    }
  }

  async logIn(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.logIn(email, password);

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
        });
      }

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi đăng nhập: " + error.message,
      });
    }
  }

  async logOut(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const result = await AuthService.logOut(refreshToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi đăng xuất: " + error.message,
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const result = await AuthService.refreshToken(refreshToken);
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi làm mới token: " + error.message,
      });
    }
  }

  async test(req, res) {
    return res.status(200).json({ message: "Thành công", success: true });
  }
}

export default new AuthController();
