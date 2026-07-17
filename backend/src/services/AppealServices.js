import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Story from "../models/Story.js";
import Conversation from "../models/Conversation.js";

import Appeal from "../models/Appeal.js";
import NotificationService from "./NotificationService.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";
import { io } from "../socket/index.js";

class AppealServices {
  async createAppeal(
    targetId,
    reason,
    appealType,
    targetModel,
    details,
    files = null,
    userId,
  ) {
    try {
      let targetType;

      switch (targetModel) {
        case "Post":
          targetType = Post;
          break;
        case "Comment":
          targetType = Comment;
          break;
        case "Story":
          targetType = Story;
          break;
        case "Conversation":
          targetType = Conversation;
          break;
        case "User":
          targetType = User;
          break;
        default:
          throw new Error("Loại đối tượng không hợp lệ");
      }

      const target = await targetType.findById(targetId);

      if (!target) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy đối tượng" },
        };
      }

      const listImage = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const uploadResult = await uploadImageFromBuffer(file.buffer);
          listImage.push(uploadResult.secure_url);
        }
      }

      const appeal = await Appeal.create({
        user: userId,
        targetId,
        targetModel: targetModel,
        appealType,
        reason,
        details,
        media: listImage,
      });

      return {
        status: 201,
        data: {
          success: true,
          message: "Đã gửi kháng nghị thành công",
          appeal: appeal,
        },
      };
    } catch (error) {
      console.error("Lỗi khi gửi kháng nghị: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  async getAppealsByUser(userId) {
    try {
      const appeals = await Appeal.find({ user: userId }).sort({ createdAt: -1 });
      return {
        status: 200,
        data: {
          success: true,
          appeals: appeals,
        },
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách kháng cáo: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }
}

export default new AppealServices();
