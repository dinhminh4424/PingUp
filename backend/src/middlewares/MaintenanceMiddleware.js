import configCache from "../services/ConfigCache.js";
import User from "../models/User.js";

/**
 * Middleware bảo trì cho các route công khai (Auth: Đăng nhập/Đăng ký)
 * Khi bật bảo trì, chặn đăng ký và chỉ cho phép Admin đăng nhập.
 */
export const publicMaintenanceMiddleware = async (req, res, next) => {
  const isMaintenance = configCache.get("system.maintenance_mode", false);
  
  if (isMaintenance) {
    const path = req.baseUrl || req.path;

    // 1. Chặn hoàn toàn đăng ký thành viên mới
    if (path.includes("/register")) {
      return res.status(503).json({
        success: false,
        isMaintenance: true,
        message: "Hệ thống đang bảo trì để nâng cấp. Vui lòng quay lại sau!",
      });
    }

    // 2. Với đăng nhập, chỉ cho phép nếu email thuộc tài khoản Admin
    if (path.includes("/login")) {
      const { email } = req.body;
      if (email) {
        try {
          const user = await User.findOne({ email });
          if (user && user.role === "admin") {
            return next(); // Cho phép Admin đăng nhập để quản trị và tắt bảo trì
          }
        } catch (error) {
          console.error("Lỗi kiểm tra quyền admin khi login ở chế độ bảo trì:", error);
        }
      }
      return res.status(503).json({
        success: false,
        isMaintenance: true,
        message: "Hệ thống đang bảo trì. Chỉ tài khoản Quản trị viên mới có thể đăng nhập lúc này!",
      });
    }
  }
  next();
};

/**
 * Middleware bảo trì cho các route riêng tư (sau protectedRoute)
 * Chặn mọi truy cập của User bình thường, chỉ cho phép Admin.
 */
export const privateMaintenanceMiddleware = (req, res, next) => {
  const isMaintenance = configCache.get("system.maintenance_mode", false);
  
  if (isMaintenance) {
    // Cho phép Admin truy cập
    if (req.user && req.user.role === "admin") {
      return next();
    }

    // Bỏ qua cho API lấy public config hoặc logout
    if (req.path === "/config/public" || req.path === "/auth/logout") {
      return next();
    }

    // Chặn người dùng thường
    return res.status(503).json({
      success: false,
      isMaintenance: true,
      message: "Hệ thống đang bảo trì để nâng cấp. Vui lòng quay lại sau!",
    });
  }
  next();
};
