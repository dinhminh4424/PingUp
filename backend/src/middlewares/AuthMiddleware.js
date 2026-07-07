import jwt, { decode } from "jsonwebtoken";

import User from "../models/User.js";

export const protectedRoute = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token",
      });
    }

    // xác nhận token hợp lệ
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: "AccessToken không hợp lệ hoặc đã hết hạn",
          });
        }

        // Tìm User
        const user = await User.findById(decodedUser.userId).select(
          "-password",
        );

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User không tồn tại",
          });
        }

        // Gán thông tin user vào req
        req.user = user;

        next();
      },
    );
  } catch (error) {
    console.error("Lỗi xác thực JWT trong Middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

export const isAdmin = (req, res, next) => {
  // req.user đã được gán từ middleware protectedRoute trước đó
  if (req.user && req.user.role === "admin") {
    next(); // Hợp lệ, đi tiếp
  } else {
    return res.status(403).json({
      success: false,
      message: "Quyền truy cập bị từ chối. Chỉ dành cho Admin.",
    });
  }
};
