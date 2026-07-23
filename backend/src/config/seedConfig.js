import SystemConfig from "../models/SystemConfig.js";

const seedConfig = async () => {
  try {
    const defaultConfigs = [
      // Nhóm General
      {
        key: "system.site_name",
        value: "PingUp",
        group: "general",
        type: "string",
        label: "Tên trang web",
        description: "Tên thương hiệu hiển thị trên thanh tiêu đề và email.",
        isPublic: true
      },
      {
        key: "system.logo_url",
        value: "/assets/logo.png",
        group: "general",
        type: "string",
        label: "Đường dẫn Logo trang web",
        description: "Đường dẫn URL ảnh logo hiển thị trên thanh điều hướng và trang đăng nhập.",
        isPublic: true
      },
      {
        key: "system.bg_image_url",
        value: "",
        group: "general",
        type: "string",
        label: "Hình nền trang web (Background Image URL)",
        description: "Đường dẫn URL hình nền chính cho giao diện trang web.",
        isPublic: true
      },
      {
        key: "system.bg_color",
        value: "#f3f4f6",
        group: "general",
        type: "string",
        label: "Màu nền trang web (Background Color HEX)",
        description: "Mã màu HEX đại diện cho màu nền trang web (ví dụ: #ffffff, #f3f4f6).",
        isPublic: true
      },
      {
        key: "system.maintenance_mode",
        value: false,
        group: "general",
        type: "boolean",
        label: "Chế độ bảo trì",
        description: "Bật chế độ này sẽ tạm thời chặn tất cả người dùng không phải Admin truy cập hệ thống.",
        isPublic: true
      },
      // Nhóm Auth & Security
      {
        key: "auth.allow_signup",
        value: true,
        group: "auth",
        type: "boolean",
        label: "Cho phép đăng ký thành viên mới",
        description: "Nếu tắt, người dùng mới sẽ không thể tạo tài khoản trên hệ thống.",
        isPublic: true
      },
      {
        key: "auth.min_password_length",
        value: 6,
        group: "auth",
        type: "number",
        label: "Độ dài mật khẩu tối thiểu",
        description: "Độ dài ký tự tối thiểu bắt buộc đối với mật khẩu đăng ký/đổi mật khẩu.",
        isPublic: false
      },
      // Nhóm Media & Uploads
      {
        key: "media.max_upload_size_mb",
        value: 10,
        group: "media",
        type: "number",
        label: "Dung lượng tệp tải lên tối đa (MB)",
        description: "Giới hạn dung lượng tệp tin (ảnh, video) người dùng có thể tải lên.",
        isPublic: false
      },
      // Nhóm Features & Limits
      {
        key: "features.max_post_length",
        value: 1000,
        group: "features",
        type: "number",
        label: "Giới hạn ký tự bài đăng",
        description: "Số ký tự tối đa cho phép trong một bài đăng.",
        isPublic: true
      },
      {
        key: "features.allow_stories",
        value: true,
        group: "features",
        type: "boolean",
        label: "Cho phép đăng tin ngắn (Stories)",
        description: "Bật/tắt tính năng đăng Story biến mất sau 24h.",
        isPublic: true
      }
    ];

    for (const config of defaultConfigs) {
      await SystemConfig.findOneAndUpdate(
        { key: config.key },
        { 
          $setOnInsert: { 
            value: config.value,
            group: config.group,
            type: config.type,
            label: config.label,
            description: config.description,
            isPublic: config.isPublic,
            options: config.options || []
          }
        },
        { upsert: true, new: true }
      );
    }
    console.log(" ==== ✅ Seeded default SystemConfigs successfully ====");
  } catch (error) {
    console.error("Error seeding SystemConfigs:", error);
  }
};

export default seedConfig;
