import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import { app, server } from "./socket/index.js";

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
});

// =================== END CLOUDINARY Configuration ===================

// ================================ PUBLIC ROUTER =====================================
import AuthRoutes from "./routes/AuthRoutes.js";
app.use("/api/auth", AuthRoutes);

// =============================== END PUBLIC ROUTER ===============================

// ================================ PRIVATE ROUTER =====================================
import { protectedRoute } from "./middlewares/AuthMiddleware.js";
app.use(protectedRoute);
// =============================== END PRIVATE ROUTER ===============================

// =========================  GỌI API ==================
import routers from "./routes/index.js";
app.use("/api", routers);
// ========================= ENS GỌI API ==================

const PORT = process.env.PORT || 5000;

// ============= KẾT NỐI CƠ SỞ DỮ LIỆU ==================

import connectDB from "./config/db.js";

connectDB().then(() => {
  // Khởi động server
  server.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
});
// ============= END  KẾT NỐI CƠ SỞ DỮ LIỆU =============
