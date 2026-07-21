import mongoose from "mongoose";
import seedPlacements from "./seedPlacements.js";

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
  } catch (error) {
    console.log(" ===== ❌❌❌❌❌❌❌ Kết Nối Thất Bại ===== ", error);
  }
};

export default connectDB;
