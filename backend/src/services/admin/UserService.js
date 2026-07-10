import User from "../../models/User.js";
import Notification from "../../models/Notification.js";
import { onlineUsers, io } from "../../socket/index.js";

class UserService {
  async getUsers(searchQuery, roleFilter, statusFilter, page = 1) {
    try {
      const limit = 10;
      const skip = (page - 1) * limit;

      let search = {};
      if (searchQuery) {
        search.$or = [
          {
            full_name: {
              $regex: searchQuery,
              $options: "i",
            },
          },
          {
            email: {
              $regex: searchQuery,
              $options: "i",
            },
          },
          {
            username: {
              $regex: searchQuery,
              $options: "i",
            },
          },
        ];
      }

      // Filter role
      if (roleFilter && roleFilter !== "all") {
        search.role = roleFilter;
      }

      // Filter status (isActive boolean)
      if (statusFilter && statusFilter !== "all") {
        search.isActive = statusFilter === "active";
      }

      // Query database for filtered users
      const users = await User.find(search)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Check online status against the Socket onlineUsers map
      const usersWithOnlineStatus = users.map((user) => {
        const userObj = user.toObject();
        userObj.activeOnline = onlineUsers
          ? onlineUsers.has(user._id.toString())
          : false;
        return userObj;
      });

      // Total matching filtered users
      const totalFilteredUsers = await User.countDocuments(search);

      // Overall stats for admin cards
      const totalUsers = await User.countDocuments({});
      const activeUsers = await User.countDocuments({ isActive: true });
      const adminUsers = await User.countDocuments({ role: "admin" });
      const onlineUsersCount = onlineUsers ? onlineUsers.size : 0;

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy Users thành công !!!!!",
          users: usersWithOnlineStatus,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalFilteredUsers / limit),
            totalUsers: totalFilteredUsers,
            limit,
          },
          stats: {
            totalUsers,
            activeUsers,
            onlineUsers: onlineUsersCount,
            adminUsers,
          },
        },
      };
    } catch (error) {
      console.error("Lỗi hệ thống Lấy Users: ", error);

      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống Lấy Users: " + error.message,
        },
      };
    }
  }

  async toggleActive(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy người dùng" },
        };
      }
      user.isActive = !user.isActive;
      await user.save();

      const notification = await Notification.create({
        receiver: user._id,
        sender: null,
        content:
          "Tài khoản của bạn đang bị khoá! Nếu có sai sót vui lòng liên hệ Admin",
        type: "system",
        detailType: "",
        referenceId: user._id,
        link: "/profile" + user._id,
      });

      // Gửi thông báo
      io.to(receiver.toString()).emit("notification:new", {
        notification: result.notification,
      });

      return {
        status: 200,
        data: {
          success: true,
          message: `Đã ${user.isActive ? "kích hoạt" : "khóa"} tài khoản thành công`,
          user,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }

  async toggleRole(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy người dùng" },
        };
      }
      user.role = user.role === "admin" ? "user" : "admin";
      await user.save();
      return {
        status: 200,
        data: {
          success: true,
          message: `Đã chuyển vai trò thành ${user.role.toUpperCase()} thành công`,
          user,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message },
      };
    }
  }
}

export default new UserService();
