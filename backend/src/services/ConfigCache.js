import SystemConfig from "../models/SystemConfig.js";

class ConfigCache {
  constructor() {
    this.cache = new Map();
    this.isInitialized = false;
  }

  /**
   * Tải toàn bộ cấu hình từ database vào bộ nhớ trong
   */
  async initialize() {
    try {
      const configs = await SystemConfig.find({});
      this.cache.clear();
      for (const config of configs) {
        this.cache.set(config.key, config.value);
      }
      this.isInitialized = true;
      console.log(`[ConfigCache] Đã tải ${this.cache.size} cấu hình hệ thống vào bộ nhớ.`);
    } catch (error) {
      console.error("[ConfigCache] Lỗi khi tải cấu hình hệ thống:", error);
    }
  }

  /**
   * Lấy giá trị cấu hình trực tiếp từ bộ nhớ (không query DB)
   * @param {string} key - Mã cấu hình (ví dụ: 'auth.allow_signup')
   * @param {*} defaultValue - Giá trị mặc định nếu cấu hình không tồn tại
   */
  get(key, defaultValue = null) {
    if (!this.isInitialized) {
      console.warn(`[ConfigCache] Cảnh báo: Truy cập key "${key}" trước khi cache được tải.`);
      return defaultValue;
    }
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    return defaultValue;
  }

  /**
   * Cập nhật giá trị cache trong bộ nhớ
   */
  updateLocal(key, value) {
    this.cache.set(key, value);
  }

  /**
   * Xóa một phần hoặc toàn bộ cache để buộc reload từ DB
   */
  invalidate(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
      this.isInitialized = false;
    }
  }
}

const configCache = new ConfigCache();
export default configCache;
