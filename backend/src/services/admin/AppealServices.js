import Comment from "../../models/Comment.js";
import Post from "../../models/Post.js";
import User from "../../models/User.js";
import Story from "../../models/Story.js";
import Conversation from "../../models/Conversation.js";

import Appeal from "../../models/Appeal.js";
import { uploadImageFromBuffer } from "../../middlewares/UpLoadMiddleware.js";
import { io } from "../../socket/index.js";

class AppealServices {
  async getAppeals(
    searchQuery,
    targetModelFilter,
    appealTypeFilter,
    statusFilter,
    startDate,
    endDate,
    page = 1,
  ) {
    try {
      const limit = 10;
      const pageNumber = Math.max(1, parseInt(page || 1));
      const skip = (pageNumber - 1) * limit;

      let search = {};

      if (searchQuery) {
        const matchUser = await User.find({
          $or: [
            { full_name: { $regex: searchQuery, $options: "i" } },
            { username: { $regex: searchQuery, $options: "i" } },
          ],
        }).select("_id");
        const userIds = matchUser.map((u) => u._id);

        search.$or = [
          { reason: { $regex: searchQuery, $options: "i" } },
          { user: { $in: userIds } },
        ];
      }

      console.log("searchQuery: ", searchQuery);
      console.log("targetModelFilter: ", targetModelFilter);
      console.log("appealTypeFilter: ", appealTypeFilter);
      console.log("statusFilter: ", statusFilter);
      console.log("startDate: ", startDate);
      console.log("endDate: ", endDate);
      console.log("page: ", page);

      if (
        targetModelFilter &&
        targetModelFilter.trim() &&
        targetModelFilter !== "all"
      ) {
        search.targetModel = targetModelFilter;
      }

      if (
        appealTypeFilter &&
        appealTypeFilter.trim() &&
        appealTypeFilter !== "all"
      ) {
        search.appealType = appealTypeFilter;
      }

      if (statusFilter && statusFilter.trim() && statusFilter !== "all") {
        search.status = statusFilter;
      }

      if (startDate || endDate) {
        search.createdAt = {};
        if (startDate) {
          search.createdAt.$gte = new Date(startDate);
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          search.createdAt.$lte = end;
        }
      }

      const appeals = await Appeal.find(search)
        .populate("user", "_id username full_name profile_picture email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalFiltered = await Appeal.countDocuments(search);
      return {
        status: 201,
        data: {
          success: true,
          message: "Lấy Danh Sách Kháng Nghị Thành công",
          appeals: appeals,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalFiltered / limit),
            totalAppeals: totalFiltered,
            limit: limit,
          },
        },
      };
    } catch (error) {
      console.error("Lỗi Khi Gửi Kháng Nghị: ", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi Hệ Thống: " + error.message },
      };
    }
  }

  async resolveAppeal(appealId, status, result, adminId) {
    try {
      if (!["Resolved", "Rejected"].includes(status)) {
        return {
          status: 400,
          data: {
            success: false,
            message: "Trạng thái không hợp lệ",
          },
        };
      }

      const appeal = await Appeal.findById(appealId);
      if (!appeal) {
        return {
          status: 404,
          data: {
            success: false,
            message: "Không tìm thấy kháng cáo",
          },
        };
      }

      appeal.status = status;
      appeal.result = result;
      appeal.resolvedBy = adminId;
      appeal.resolvedAt = new Date();

      await appeal.save();

      // If resolved (approved / restored), restore the target content
      if (status === "Resolved") {
        if (appeal.targetModel === "Post") {
          await Post.findByIdAndUpdate(appeal.targetId, {
            isActive: true,
            isDelete: false,
          });
        } else if (appeal.targetModel === "Comment") {
          await Comment.findByIdAndUpdate(appeal.targetId, {
            isActive: true,
            isDelete: false,
          });
        } else if (appeal.targetModel === "Story") {
          await Story.findByIdAndUpdate(appeal.targetId, {
            isActive: true,
            isDelete: false,
          });
        } else if (appeal.targetModel === "Conversation") {
          await Conversation.findByIdAndUpdate(appeal.targetId, {
            isActive: true,
            isDelete: false,
          });
        }
      }

      // Populate user info to return complete object
      const populatedAppeal = await Appeal.findById(appeal._id).populate(
        "user",
        "_id username full_name profile_picture email"
      );

      return {
        status: 200,
        data: {
          success: true,
          message: "Xử lý kháng cáo thành công!",
          appeal: populatedAppeal,
        },
      };
    } catch (error) {
      console.error("Lỗi khi xử lý kháng cáo: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống: " + error.message,
        },
      };
    }
  }
}

export default new AppealServices();
