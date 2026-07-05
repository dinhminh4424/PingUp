import multer from "multer";

import { v2 as cloudinary } from "cloudinary";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 1024 * 1024 * 4, //4MB
  },
});

export const uploadImageFromBuffer = (buffer, option) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "minh_Pingup/avatar", // Lưu ảnh vào folder trên Cloudinary:minh_appChat/avatar
        resource_type: "image", // Chỉ cho upload ảnh, Nếu video hoặc file khác → lỗi
        // Cloudinary sẽ xử lý ảnh trước khi lưu:
        // 1.width: 200 → resize ngang 200px
        // 2.height: 200 → resize dọc 200px
        // 3.crop: fill → cắt ảnh để đủ kích thước

        // transformation: [{ width: 200, height: 200, crop: "fill" }],
        ...option, // Cho phép truyền config ngoài vào
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(buffer);
  });
};
