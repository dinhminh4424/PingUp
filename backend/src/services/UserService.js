import User from "../models/User.js";
import Report from "../models/Report.js";
import Follow from "../models/Follow.js";
import { uploadImageFromBuffer } from "../middlewares/UpLoadMiddleware.js";
import Connection from "../models/Connection.js";
import mongoose from "mongoose";
import ConnectionRequest from "../models/ConnectionRequest.js";
import { isConnected } from "../utils/connectionHelper.js";

class UserService {
  async getUserById(id, viewer = null) {
    try {
      const user = await User.findOne({
        _id: id,
      });

      if (!user) {
        return {
          status: 404,
          data: {
            success: false,
            message: "Không tìm thấy người dùng",
          },
        };
      }

      const followersCount = await Follow.countDocuments({ following: id });
      const followingCount = await Follow.countDocuments({ follower: id });

      const userObj = user.toObject();
      userObj.followersCount = followersCount;
      userObj.followingCount = followingCount;

      // Kiểm tra quyền riêng tư (isPrivate)
      const viewerId = viewer ? viewer._id : null;
      const viewerRole = viewer ? viewer.role : null;
      
      const isSelf = viewerId && viewerId.toString() === id.toString();
      const isAdmin = viewerRole === "admin";
      
      let isProfileHidden = false;

      if (user.isPrivate && !isSelf && !isAdmin) {
        // Kiểm tra quan hệ bạn bè (đã kết nối)
        const connected = await isConnected(id, viewerId);
        if (!connected) {
          isProfileHidden = true;
          // Ẩn thông tin nhạy cảm
          userObj.bio = "Tài khoản này là riêng tư.";
          userObj.location = "Bảo mật";
          userObj.cover_photo = "";
        }
      }

      userObj.isProfileHidden = isProfileHidden;

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy User by id thành công: " + id,
          user: userObj,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống Lấy User by id: " + error.message,
        },
      };
    }
  }

  async updateInfoUser(
    id,
    username,
    full_name,
    bio,
    location,
    profile_picture,
    cover_photo,
  ) {
    try {
      const data = {};

      if (username !== undefined) data.username = username;
      if (full_name !== undefined) data.full_name = full_name;
      if (bio !== undefined) data.bio = bio;
      if (location !== undefined) data.location = location;

      if (profile_picture) {
        const uploadResult = await uploadImageFromBuffer(
          profile_picture.buffer,
        );

        data.profile_picture = uploadResult.secure_url;
      }

      if (cover_photo) {
        const uploadResult = await uploadImageFromBuffer(cover_photo.buffer);

        data.cover_photo = uploadResult.secure_url;
      }

      const user = await User.findByIdAndUpdate(id, data, {
        returnDocument: "after",
      });

      console.log("User: ", user);

      return {
        status: 200,
        data: {
          success: true,
          message: `Cạp nhật thông tin user id: ${id}  thành công! `,
          user: user,
        },
      };
    } catch (error) {
      console.log("Lỗi khi chỉnh sửa thông tin user updateInfoUser: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message:
            "Lỗi khi chỉnh sửa thông tin user updateInfoUser: " + error.message,
        },
      };
    }
  }

  async findUserBySearch(search, userId) {
    try {
      let rawUsers = [];

      if (!search || search.trim() === "") {
        // Lấy danh sách bạn bè
        const connections = await Connection.find({
          $or: [{ userA: userId }, { userB: userId }],
        })
          .populate("userA", "full_name username profile_picture location bio")
          .populate("userB", "full_name username profile_picture location bio")
          .lean();

        const friendUsers = connections
          .map((item) => {
            if (!item.userA || !item.userB) return null;
            return item.userA._id.toString() === userId.toString()
              ? item.userB
              : item.userA;
          })
          .filter(Boolean);

        // Lấy danh sách người mình đang follow
        const follows = await Follow.find({
          follower: userId,
        })
          .populate(
            "following",
            "full_name username profile_picture location bio",
          )
          .lean();

        const followUsers = follows
          .map((item) => item.following)
          .filter(Boolean);

        // Gộp và loại bỏ trùng
        rawUsers = Array.from(
          new Map(
            [...friendUsers, ...followUsers].map((user) => [
              user._id.toString(),
              user,
            ]),
          ).values(),
        );
      } else {
        rawUsers = await User.find({
          _id: { $ne: userId },
          $or: [
            { full_name: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
            { bio: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
          ],
        }).lean();
      }

      const myId = new mongoose.Types.ObjectId(userId);

      const users = await Promise.all(
        rawUsers.map(async (user) => {
          const [
            follow,
            connection,
            reqSentDoc,
            reqReceivedDoc,
            followersCount,
          ] = await Promise.all([
            Follow.exists({
              follower: myId,
              following: user._id,
            }),

            Connection.exists({
              $or: [
                { userA: myId, userB: user._id },
                { userA: user._id, userB: myId },
              ],
            }),

            ConnectionRequest.findOne({
              sender: myId,
              receiver: user._id,
              status: "pending",
            }).lean(),

            ConnectionRequest.findOne({
              sender: user._id,
              receiver: myId,
              status: "pending",
            }).lean(),

            Follow.countDocuments({
              following: user._id,
            }),
          ]);

          return {
            ...user,
            isFollowing: !!follow,
            isConnected: !!connection,
            requestSent: !!reqSentDoc,
            requestReceived: !!reqReceivedDoc,
            requestId: reqSentDoc?._id || reqReceivedDoc?._id || null,
            followersCount: followersCount || 0,
          };
        }),
      );

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách người dùng thành công",
          users,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống tìm kiếm người dùng: " + error.message,
        },
      };
    }
  }

  async createReportUser(
    id,
    targetType = "user",
    userId,
    reason,
    details,
    files,
  ) {
    try {
      if (!id) {
        return {
          status: 400,
          data: {
            success: false,
            message: "Thiếu Id User Báo Cáo",
          },
        };
      }
      const user = await User.findById(id);
      if (!user) {
        return {
          status: 404,
          data: {
            success: false,
            message: "Thiếu Id User Báo Cáo",
          },
        };
      }

      const listImage = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const uploadResult = await uploadImageFromBuffer(file.buffer);
          listImage.push(uploadResult.secure_url);
        }
      }

      const report = await Report.create({
        reporterId: userId,
        targetId: id,
        targetType: targetType,
        reason: reason,
        details: details,
        file: listImage,
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Tạo Báo Cáo User Thành Công",
          report,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi Hệ Thống Khi Báo Cáo Người Dùng: " + error.message,
        },
      };
    }
  }

  /**
   * Cập nhật cài đặt tài khoản riêng tư (isPrivate)
   */
  async updatePrivacySettings(userId, isPrivate) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isPrivate },
        { returnDocument: "after" }
      ).select("-password");

      return {
        status: 200,
        data: {
          success: true,
          message: "Cập nhật quyền riêng tư thành công!",
          user,
        },
      };
    } catch (error) {
      console.error("Lỗi trong UserService.updatePrivacySettings:", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi cơ sở dữ liệu khi cập nhật quyền riêng tư.",
        },
      };
    }
  }
}

export default new UserService();
