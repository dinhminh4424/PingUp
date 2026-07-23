import api from "../lib/axios";

/**
 * Lấy danh sách cấu hình hệ thống công khai (isPublic: true)
 */
export const getPublicConfigs = async () => {
  const res = await api.get("/api/config/public");
  return res.data;
};
