import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import { app, server } from "./socket/index.js";
import configCache from "./services/ConfigCache.js";

dotenv.config(); //Khởi tạo biên môi trường

// const app = express();

app.use(express.json()); // cho phép phân tích json
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL, //
    credentials: true,
  }),
);

// ===================  CLOUDINARY Configuration ===================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  secure: true,
});

// =================== END CLOUDINARY Configuration ===================

// ================================ PUBLIC ROUTER =====================================
import AuthRoutes from "./routes/AuthRoutes.js";
import SystemConfigRoutes from "./routes/SystemConfigRoutes.js";
import { publicMaintenanceMiddleware, privateMaintenanceMiddleware } from "./middlewares/MaintenanceMiddleware.js";

app.use("/api/auth/login", publicMaintenanceMiddleware);
app.use("/api/auth/register", publicMaintenanceMiddleware);
app.use("/api/auth", AuthRoutes);
app.use("/api/config", SystemConfigRoutes);

// =============================== END PUBLIC ROUTER ===============================

// ================================ PRIVATE ROUTER =====================================
import { protectedRoute } from "./middlewares/AuthMiddleware.js";
app.use(protectedRoute);
app.use(privateMaintenanceMiddleware);
// =============================== END PRIVATE ROUTER ===============================

// =========================  GỌI API ==================
import routers from "./routes/index.js";
app.use("/api", routers);
// ========================= ENS GỌI API ==================

const PORT = process.env.PORT;

// ============= KẾT NỐI CƠ SỞ DỮ LIỆU ==================

import connectDB from "./config/db.js";

connectDB().then(async () => {
  // Khởi tạo Cache cấu hình hệ thống
  await configCache.initialize();

  // Khởi động server
  server.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
});
// ============= END  KẾT NỐI CƠ SỞ DỮ LIỆU =============
