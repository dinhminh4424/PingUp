import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";
import Feedback from "../models/Feedback.js";

import User from "../models/User.js";

class FeedbackService {
  // Get conversations list with pagination and search
  async createFeedback(category, rating, comment, files, userId) {
    try {
      const listImage = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const uploadResult = await uploadImageFromBuffer(file.buffer);
          listImage.push(uploadResult.secure_url);
        }
      }

      const feedback = await Feedback.create({
        category,
        rating,
        comment,
        media: listImage,
        userId: userId,
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Tạo Feedback thành công!",
          feedback: feedback,
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống Tạo Feedback: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }
}

export default new FeedbackService();
