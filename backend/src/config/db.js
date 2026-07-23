import mongoose from "mongoose";
import seedPlacements from "./seedPlacements.js";
import seedConfig from "./seedConfig.js";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("Database Kết nối "));
    await mongoose.connect(
      process.env.MONGODB_URL + "/" + process.env.DATABASE_NAME,
    );
    console.log(
      " ==== ✅✅✅✅✅✅✅✅✅  Kết Nối Cơ Sở Dữ Liệu Thành Công !!!! ====",
    );
    // Tự động seed các vị trí quảng cáo
    await seedPlacements();
    // Tự động seed các cấu hình hệ thống mặc định
    await seedConfig();
  } catch (error) {
    console.log(" ===== ❌❌❌❌❌❌❌ Kết Nối Thất Bại ===== ", error);
  }
};

export default connectDB;
