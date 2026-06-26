import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config(); //Khởi tạo biên môi trường

const app = express();

app.use(express.json()); // cho phép phân tích json
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL, //
    credentials: true,
  }),
);

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
  app.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
});
// ============= END  KẾT NỐI CƠ SỞ DỮ LIỆU =============
