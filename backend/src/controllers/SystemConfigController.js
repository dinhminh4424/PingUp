import SystemConfig from "../models/SystemConfig.js";
import configCache from "../services/ConfigCache.js";

/**
 * Lấy các cấu hình công khai (isPublic: true) gửi về cho Client
 */
export const getPublicConfigs = async (req, res) => {
  try {
    // Tìm các cấu hình đánh dấu public từ DB
    const publicConfigs = await SystemConfig.find({ isPublic: true }).select("key value -_id");
    
    // Tạo cấu trúc map key-value và lấy giá trị từ Cache cho nhanh
    const configMap = {};
    for (const config of publicConfigs) {
      configMap[config.key] = configCache.get(config.key, config.value);
    }

    return res.status(200).json({
      success: true,
      data: configMap,
    });
  } catch (error) {
    console.error("Lỗi getPublicConfigs:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy cấu hình hệ thống công khai.",
    });
  }
};
