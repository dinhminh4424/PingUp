import SystemConfig from "../../models/SystemConfig.js";
import SystemConfigHistory from "../../models/SystemConfigHistory.js";
import configCache from "../../services/ConfigCache.js";
import { uploadImageFromBuffer } from "../../middlewares/UpLoadMiddleware.js";

/**
 * Lấy toàn bộ cấu hình hệ thống cho trang Admin
 */
export const getAdminConfigs = async (req, res) => {
  try {
    const configs = await SystemConfig.find({}).sort({ group: 1, key: 1 });
    return res.status(200).json({
      success: true,
      data: configs,
    });
  } catch (error) {
    console.error("Lỗi getAdminConfigs:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách cấu hình.",
    });
  }
};

/**
 * Cập nhật nhiều cấu hình cùng lúc, ghi nhận lịch sử và invalidate cache
 */
export const updateAdminConfigsBatch = async (req, res) => {
  try {
    const { updates } = req.body; // Mảng các object { key, value }
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu cập nhật không hợp lệ.",
      });
    }

    const updatedConfigs = [];
    const historiesToInsert = [];
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "";
    const userAgent = req.headers["user-agent"] || "";

    for (const update of updates) {
      const { key, value } = update;
      
      const currentConfig = await SystemConfig.findOne({ key });
      if (!currentConfig) {
        continue;
      }

      // So sánh giá trị cũ và mới dưới dạng JSON String để kiểm tra thay đổi
      const oldValueJSON = JSON.stringify(currentConfig.value);
      const newValueJSON = JSON.stringify(value);

      if (oldValueJSON !== newValueJSON) {
        const oldValue = currentConfig.value;
        currentConfig.value = value;
        currentConfig.updatedBy = req.user._id;
        await currentConfig.save();

        // Cập nhật lại RAM Cache
        configCache.updateLocal(key, value);

        // Chuẩn bị lưu lịch sử
        historiesToInsert.push({
          configId: currentConfig._id,
          key: currentConfig.key,
          label: currentConfig.label,
          oldValue,
          newValue: value,
          updatedBy: req.user._id,
          ipAddress,
          userAgent
        });

        updatedConfigs.push(currentConfig);
      }
    }

    // Ghi vào bảng lịch sử nếu có thay đổi thực tế
    if (historiesToInsert.length > 0) {
      await SystemConfigHistory.insertMany(historiesToInsert);
    }

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật thành công ${updatedConfigs.length} cấu hình.`,
      data: updatedConfigs,
    });
  } catch (error) {
    console.error("Lỗi updateAdminConfigsBatch:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật cấu hình.",
    });
  }
};

/**
 * Lấy lịch sử chỉnh sửa cấu hình hệ thống
 */
export const getConfigHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const total = await SystemConfigHistory.countDocuments({});
    const history = await SystemConfigHistory.find({})
      .populate("updatedBy", "full_name username profile_picture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Lỗi getConfigHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử cấu hình.",
    });
  }
};

/**
 * Tải ảnh cấu hình lên Cloudinary (Logo, Background, v.v.)
 */
export const uploadConfigImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy tệp tải lên.",
      });
    }

    const uploadResult = await uploadImageFromBuffer(req.file.buffer, {
      folder: "minh_Pingup/config",
    });

    return res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Lỗi uploadConfigImage:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tải ảnh lên.",
    });
  }
};
