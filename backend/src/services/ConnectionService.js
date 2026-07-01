import ConnectionRequest from "../models/ConnectionRequest.js";
import Connection from "../models/Connection.js";
import Follow from "../models/Follow.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import NotificationService from "./NotificationService.js";

class ConnectionService {
  async sendConnectionRequest(sender, receiver, message = "") {
    try {
      if (sender.toString() === receiver.toString()) {
        return {
          status: 400,
          data: {
            success: false,
            message: "Bạn không thể gửi lời mời kết bạn cho chính mình",
          },
        };
      }

      // Kiểm tra xem đã là bạn bè chưa
      const userA = sender.toString() < receiver.toString() ? sender : receiver;
      const userB = sender.toString() < receiver.toString() ? receiver : sender;
      const existingConnection = await Connection.findOne({ userA, userB });
      if (existingConnection) {
        return {
          status: 400,
          data: {
            success: false,
            message: "Hai người đã là bạn bè",
          },
        };
      }

      // Kiểm tra xem đã có lời mời kết bạn nào chưa
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      });

      if (existingRequest) {
        if (existingRequest.status === "pending") {
          return {
            status: 400,
            data: {
              success: false,
              message: "Đã tồn tại lời mời kết bạn giữa hai người",
            },
          };
        } else {
          // Reset status to pending
          existingRequest.status = "pending";
          existingRequest.sender = sender;
          existingRequest.receiver = receiver;
          await existingRequest.save();

          const senderUser = await User.findById(sender);
          const senderName = senderUser
            ? senderUser.full_name || senderUser.username
            : "Một người dùng";
          await NotificationService.createNotification({
            receiver,
            sender,
            content: `${senderName} đã gửi cho bạn một lời mời kết bạn.`,
            type: "friend_request",
            referenceId: existingRequest._id,
            link: `/profile/${sender}`,
          });

          return {
            status: 200,
            data: {
              success: true,
              message: "Đã gửi lại lời mời kết bạn thành công",
              request: existingRequest,
            },
          };
        }
      }

      const requestConnection = await ConnectionRequest.create({
        sender,
        receiver,
        message,
        status: "pending",
      });

      const senderUser = await User.findById(sender);
      const senderName = senderUser
        ? senderUser.full_name || senderUser.username
        : "Một người dùng";
      await NotificationService.createNotification({
        receiver,
        sender,
        content: `${senderName} đã gửi cho bạn một lời mời kết bạn.`,
        type: "friend_request",
        referenceId: requestConnection._id,
        link: `/profile/${sender}`,
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Đã gửi lời mời thành công",
          request: requestConnection,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi khi gửi lời mời kết bạn: " + error.message,
        },
      };
    }
  }

  async getConnectionStatus(user1, user2) {
    try {
      // Check follow
      const isFollowing = (await Follow.findOne({
        follower: user1,
        following: user2,
      }))
        ? true
        : false;

      // Check friend connection
      const userA = user1.toString() < user2.toString() ? user1 : user2;
      const userB = user1.toString() < user2.toString() ? user2 : user1;
      const existingConnection = await Connection.findOne({ userA, userB });

      if (existingConnection) {
        return {
          status: 200,
          data: {
            success: true,
            connectionStatus: "connected",
            isFollowing,
          },
        };
      }

      // Check connection request
      const request = await ConnectionRequest.findOne({
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 },
        ],
      });

      if (request && request.status === "pending") {
        return {
          status: 200,
          data: {
            success: true,
            connectionStatus:
              request.sender.toString() === user1.toString()
                ? "pending_sent"
                : "pending_received",
            requestId: request._id,
            isFollowing,
          },
        };
      }

      return {
        status: 200,
        data: {
          success: true,
          connectionStatus: "none",
          isFollowing,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi khi kiểm tra trạng thái kết bạn: " + error.message,
        },
      };
    }
  }

  async acceptConnectionRequest(requestId, userId) {
    try {
      const request = await ConnectionRequest.findById(requestId);
      if (!request) {
        return {
          status: 444,
          data: { success: false, message: "Không tìm thấy lời mời kết bạn" },
        };
      }

      if (request.receiver.toString() !== userId.toString()) {
        return {
          status: 403,
          data: {
            success: false,
            message: "Bạn không có quyền xác nhận lời mời này",
          },
        };
      }

      request.status = "accepted";
      await request.save();

      // Tạo Connection mới
      const userA =
        request.sender.toString() < request.receiver.toString()
          ? request.sender
          : request.receiver;
      const userB =
        request.sender.toString() < request.receiver.toString()
          ? request.receiver
          : request.sender;

      await Connection.findOneAndUpdate(
        { userA, userB },
        { userA, userB },
        { upsert: true, new: true },
      );

      // Tự động follow nhau khi thành bạn bè
      await Follow.findOneAndUpdate(
        { follower: request.sender, following: request.receiver },
        {},
        { upsert: true },
      );
      await Follow.findOneAndUpdate(
        { follower: request.receiver, following: request.sender },
        {},
        { upsert: true },
      );

      // Tự động tạo hộp thoại chat (direct conversation) giữa 2 người
      const conversationExists = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [request.sender, request.receiver] },
      });
      if (!conversationExists) {
        await Conversation.create({
          type: "direct",
          participants: [
            { userId: request.sender, joinedAt: new Date() },
            { userId: request.receiver, joinedAt: new Date() },
          ],
          lastMessageAt: new Date(),
        });
      }

      const accepterUser = await User.findById(userId);
      const accepterName = accepterUser
        ? accepterUser.full_name || accepterUser.username
        : "Một người dùng";
      await NotificationService.createNotification({
        receiver: request.sender,
        sender: userId,
        content: `${accepterName} đã chấp nhận lời mời kết bạn của bạn.`,
        type: "friend_accept",
        referenceId: userId,
        link: `/profile/${userId}`,
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Đã đồng ý kết bạn thành công",
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi đồng ý kết bạn: " + error.message,
        },
      };
    }
  }

  async rejectConnectionRequest(requestId, userId) {
    try {
      const request = await ConnectionRequest.findById(requestId);
      if (!request) {
        return {
          status: 444,
          data: { success: false, message: "Không tìm thấy lời mời kết bạn" },
        };
      }

      // Người nhận hoặc người gửi đều có quyền hủy/từ chối
      if (
        request.receiver.toString() !== userId.toString() &&
        request.sender.toString() !== userId.toString()
      ) {
        return {
          status: 403,
          data: { success: false, message: "Bạn không có quyền này" },
        };
      }

      await ConnectionRequest.findByIdAndDelete(requestId);

      return {
        status: 200,
        data: {
          success: true,
          message: "Đã từ chối/hủy lời mời kết bạn thành công",
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi từ chối lời mời: " + error.message,
        },
      };
    }
  }

  async disconnectConnection(user1, user2) {
    try {
      const userA = user1.toString() < user2.toString() ? user1 : user2;
      const userB = user1.toString() < user2.toString() ? user2 : user1;

      await Connection.findOneAndDelete({ userA, userB });
      await ConnectionRequest.findOneAndDelete({
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 },
        ],
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Đã hủy kết bạn thành công",
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: { success: false, message: "Lỗi hủy kết bạn: " + error.message },
      };
    }
  }

  async toggleFollow(follower, following) {
    try {
      const existing = await Follow.findOne({ follower, following });
      if (existing) {
        await Follow.findByIdAndDelete(existing._id);
        return {
          status: 200,
          data: {
            success: true,
            isFollowing: false,
            message: "Đã hủy theo dõi",
          },
        };
      } else {
        await Follow.create({ follower, following });
        return {
          status: 200,
          data: {
            success: true,
            isFollowing: true,
            message: "Đã theo dõi thành công",
          },
        };
      }
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi toggle follow: " + error.message,
        },
      };
    }
  }
  async getPendingRequests(userId) {
    try {
      const requests = await ConnectionRequest.find({
        receiver: userId,
        status: "pending",
      }).populate(
        "sender",
        "_id email username full_name bio profile_picture cover_photo location",
      );

      const senders = requests
        .map((r) => {
          if (!r.sender) return null;
          const senderObj = r.sender.toObject();
          senderObj.requestId = r._id; // Đính kèm requestId để duyệt/từ chối
          return senderObj;
        })
        .filter(Boolean);

      return {
        status: 200,
        data: {
          success: true,
          requests: senders,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi lấy danh sách kết bạn chờ: " + error.message,
        },
      };
    }
  }

  async getConnections(userId) {
    try {
      const connections = await Connection.find({
        $or: [{ userA: userId }, { userB: userId }],
      })
        .populate(
          "userA",
          "_id email username full_name bio profile_picture cover_photo location",
        )
        .populate(
          "userB",
          "_id email username full_name bio profile_picture cover_photo location",
        );

      const friends = connections
        .map((c) => {
          return c.userA._id.toString() === userId.toString()
            ? c.userB
            : c.userA;
        })
        .filter(Boolean);

      return {
        status: 200,
        data: {
          success: true,
          connections: friends,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi lấy danh sách bạn bè: " + error.message,
        },
      };
    }
  }
}

export default new ConnectionService();
