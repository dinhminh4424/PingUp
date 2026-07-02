import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ❗ Chỉ user đã đăng nhập hợp lệ mới được kết nối socket

// | param  | nghĩa                    |
// | ------ | ------------------------ |
// | socket | thông tin connection     |
// | next   | gọi để cho phép tiếp tục |

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log(
        "socketMiddleware : UNAUTHORIZED - Token không tồn tại -  Không tìm thấy token trong handshake",
      );
      return next(
        new Error(
          "UNAUTHORIZED - Token không tồn tại -  Không tìm thấy token trong handshake",
        ),
      );
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      console.log(
        "socketMiddleware : Không mã hoá được token - Token không hợp lệ hoặc đã hết hạn",
      );
      return next(
        new Error("UNAUTHORIZED - Token không hợp lệ hoặc đã hết hạn "),
      );
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("socketMiddleware : Không tìm thấy người dùng ");
      return next(new Error("UNAUTHORIZED - Không tìm thấy người dùng"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error(
      "socketMiddleware.js Lỗi Khi verify JWT trong socketMiddleware : ",
      error,
    );
    return next(new Error("UNAUTHORIZED"));
  }
};
