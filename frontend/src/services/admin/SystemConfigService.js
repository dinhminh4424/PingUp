import api from "../../lib/axios";

/**
 * Lấy danh sách toàn bộ cấu hình hệ thống
 */
export const getAdminConfigs = async () => {
  const res = await api.get("/api/admin/config");
  return res.data;
};

/**
 * Cập nhật nhiều cấu hình cùng một lúc
 * @param {Array<{key: string, value: any}>} updates 
 */
export const updateAdminConfigsBatch = async (updates) => {
  const res = await api.put("/api/admin/config/batch", { updates });
  return res.data;
};

/**
 * Lấy lịch sử thay đổi cấu hình hệ thống (phân trang)
 * @param {number} page 
 * @param {number} limit 
 */
export const getConfigHistory = async (page = 1, limit = 15) => {
  const res = await api.get("/api/admin/config/history", {
    params: { page, limit },
  });
  return res.data;
};

/**
 * Tải ảnh cấu hình hệ thống lên Cloudinary
 * @param {File} file 
 */
export const uploadConfigImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/api/admin/config/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
