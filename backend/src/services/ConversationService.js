import Conversation from "../models/Conversation.js";
import { io } from "../socket/index.js";
import Report from "../models/Report.js";

class ConversationService {
  formatConversation(conv, userId) {
    if (!conv) return null;
    const convObj = conv.toObject ? conv.toObject() : conv;

    // Convert Mongoose Map (unReadCount) to plain object
    if (conv.unReadCount instanceof Map) {
      convObj.unReadCount = Object.fromEntries(conv.unReadCount);
    } else if (convObj.unReadCount && typeof convObj.unReadCount.get === "function") {
      convObj.unReadCount = Object.fromEntries(convObj.unReadCount);
    }

    if (convObj.type === "direct") {
      const otherParticipant = convObj.participants.find(
        (p) => p.userId && p.userId._id.toString() !== userId.toString(),
      );
      if (otherParticipant && otherParticipant.userId) {
        convObj.profile_picture = otherParticipant.userId.profile_picture;
        convObj.full_name = otherParticipant.userId.full_name;
        convObj.username = otherParticipant.userId.username;
        convObj.bio = otherParticipant.userId.bio;
        convObj.targetUserId = otherParticipant.userId._id;
      }
    } else {
      convObj.full_name = convObj.group?.name || "Group Chat";
      convObj.profile_picture = convObj.group?.imageGroup || "";
      convObj.bio = "Group conversation";
    }
    return convObj;
  }

  async getConversations(userId) {
    try {
      if (!userId) {
        console.log(" ==== Không có userId ====");
        return {
          status: 400,
          data: {
            success: false,
            message: "Lỗi hệ thống getConversations: Không có userId",
          },
        };
      }

      const conversations = await Conversation.find({
        "participants.userId": userId,
      })
        .populate(
          "participants.userId",
          "_id email username full_name bio profile_picture cover_photo location",
        )
        .populate("seenBy")
        .populate("lastMessage.senderId")
        .sort({ lastMessageAt: -1 });

      const formattedConversations = conversations.map((conv) => 
        this.formatConversation(conv, userId)
      );

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy danh sách Conversations thành công !!",
          conversations: formattedConversations,
        },
      };
    } catch (error) {
      console.log("Lỗi khi lấy danh sách hộp thoại: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi khi lấy danh sách hộp thoại: " + error.message,
        },
      };
    }
  }

  async getConversationById(id, userId) {
    try {
      if (!id) {
        console.log(" ==== Không có id ====");
        return {
          status: 400,
          data: {
            success: false,
            message: "Lỗi hệ thống getConversations: Không có id: " + id,
          },
        };
      }

      const conversation = await Conversation.findById(id)
        .populate(
          "participants.userId",
          "_id email username full_name bio profile_picture cover_photo location",
        )
        .populate(
          "joinRequests.userId",
          "_id email username full_name bio profile_picture cover_photo location",
        )
        .populate("seenBy")
        .populate("lastMessage.senderId");

      if (!conversation) {
        return {
          status: 404,
          data: {
            success: false,
            message: "Không tìm thấy hộp thoại",
          },
        };
      }

      const formatted = this.formatConversation(conversation, userId);

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy chi tiết Conversations thành công !!",
          conversation: formatted,
        },
      };
    } catch (error) {
      console.log("Lỗi khi lấy chi tiết hộp thoại: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi khi lấy chi tiết hộp thoại: " + error.message,
        },
      };
    }
  }

  async createConversation(type, name, memberIds, userId, imageGroup = "") {
    try {
      let conversation;
      let participants = memberIds.map((memberId) => {
        return {
          userId: memberId,
          joinedAt: new Date(),
        };
      });

      if (type === "direct") {
        const targetMemberId = memberIds[0];

        conversation = await Conversation.findOne({
          type: "direct",
          "participants.userId": { $all: [userId, targetMemberId] },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            type: "direct",
            participants: [
              { userId: userId, joinedAt: new Date() },
              { userId: targetMemberId, joinedAt: new Date() },
            ],
            lastMessageAt: new Date(),
          });
        }
      } else if (type === "group") {
        let group = {
          name: name,
          createBy: userId,
          imageGroup: imageGroup,
        };

        conversation = await Conversation.create({
          type: "group",
          participants: [
            { userId: userId, joinedAt: new Date(), role: "admin" },
            ...participants.map(p => ({ ...p, role: "member" })),
          ],
          lastMessageAt: new Date(),
          group: group,
        });
      }

      if (!conversation) {
        console.log("createConversation: lỗi tạo conversation ");
        return {
          status: 400,
          data: {
            success: false,
            message: "Lỗi khi tạo hộp thoại mới",
          },
        };
      }

      const populated = await conversation.populate([
        { path: "participants.userId" },
        { path: "seenBy" },
        { path: "lastMessage.senderId" },
      ]);

      const convObj = populated.toObject();
      if (convObj.type === "direct") {
        const otherParticipant = convObj.participants.find(
          (p) => p.userId && p.userId._id.toString() !== userId.toString(),
        );
        if (otherParticipant && otherParticipant.userId) {
          convObj.profile_picture = otherParticipant.userId.profile_picture;
          convObj.full_name = otherParticipant.userId.full_name;
          convObj.username = otherParticipant.userId.username;
          convObj.bio = otherParticipant.userId.bio;
          convObj.targetUserId = otherParticipant.userId._id;
        }
      } else {
        convObj.full_name = convObj.group?.name || "Group Chat";
        convObj.profile_picture = convObj.group?.imageGroup || "";
        convObj.bio = "Group conversation";
      }

      return {
        status: 200,
        data: {
          success: true,
          message: "Tạo hộp thoại mới thành công",
          conversation: convObj,
        },
      };
    } catch (error) {
      console.log("Lỗi hệ thống tạo hộp thoại: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống tạo hộp thoại: " + error.message,
        },
      };
    }
  }
  async updateGroup(conversationId, name, imageGroup) {
    try {
      const updateData = {};
      if (name) updateData["group.name"] = name;
      if (imageGroup !== undefined) updateData["group.imageGroup"] = imageGroup;

      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { $set: updateData },
        { returnDocument: "after" }
      ).populate(
        "participants.userId",
        "_id email username full_name bio profile_picture cover_photo location"
      );

      if (!conversation) {
        return {
          status: 404,
          data: {
            success: false,
            message: "Không tìm thấy hộp thoại",
          },
        };
      }

      return {
        status: 200,
        data: {
          success: true,
          message: "Cập nhật nhóm thành công",
          conversation,
        },
      };
    } catch (error) {
      console.log("Lỗi cập nhật nhóm: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống: " + error.message,
        },
      };
    }
  }
  async updateCustomization(conversationId, themeType, themeValue, quickEmoji) {
    try {
      const updateData = {};
      if (themeType !== undefined) updateData["theme.type"] = themeType;
      if (themeValue !== undefined) updateData["theme.value"] = themeValue;
      if (quickEmoji !== undefined) updateData["quickEmoji"] = quickEmoji;

      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { $set: updateData },
        { returnDocument: "after" }
      ).populate(
        "participants.userId",
        "_id email username full_name bio profile_picture cover_photo location"
      );

      if (!conversation) {
        return {
          status: 404,
          data: {
            success: false,
            message: "Không tìm thấy hộp thoại",
          },
        };
      }

      return {
        status: 200,
        data: {
          success: true,
          message: "Cập nhật tùy chỉnh thành công",
          conversation,
        },
      };
    } catch (error) {
      console.log("Lỗi cập nhật tùy chỉnh: ", error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Lỗi hệ thống: " + error.message,
        },
      };
    }
  }

  async markAsRead(conversationId, userId) {
    try {
      if (!conversationId || !userId) {
        return {
          status: 400,
          data: { success: false, message: "Missing conversationId or userId" }
        };
      }

      const unReadField = `unReadCount.${userId.toString()}`;
      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          $set: { [unReadField]: 0 },
          $addToSet: { seenBy: userId }
        },
        { returnDocument: "after" }
      ).populate(
        "participants.userId",
        "_id email username full_name bio profile_picture cover_photo location"
      ).populate("seenBy").populate("lastMessage.senderId");

      if (!conversation) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy cuộc hội thoại" }
        };
      }

      const formattedResponse = this.formatConversation(conversation, userId);

      // Broadcast to all participants so unReadCount and seenBy syncs in real-time
      conversation.participants.forEach((participant) => {
        const pId = participant.userId?._id?.toString() || participant.userId?.toString();
        if (pId) {
          const formattedForParticipant = this.formatConversation(conversation, pId);
          io.to(pId).emit("conversationUpdated", formattedForParticipant);
        }
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Đánh dấu đã đọc thành công",
          conversation: formattedResponse
        }
      };
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }

  async leaveGroup(conversationId, userId) {
    try {
      if (!conversationId || !userId) {
        return {
          status: 400,
          data: { success: false, message: "Thiếu thông tin cuộc trò chuyện hoặc người dùng" }
        };
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return {
          status: 404,
          data: { success: false, message: "Không tìm thấy cuộc trò chuyện" }
        };
      }

      if (conversation.type !== "group") {
        return {
          status: 400,
          data: { success: false, message: "Hộp thoại này không phải là nhóm" }
        };
      }

      // Remove the participant
      conversation.participants = conversation.participants.filter(
        (p) => p.userId?.toString() !== userId.toString()
      );

      await conversation.save();

      // Emit to remaining participants
      conversation.participants.forEach((participant) => {
        const pId = participant.userId?._id?.toString() || participant.userId?.toString();
        if (pId) {
          const formattedForParticipant = this.formatConversation(conversation, pId);
          io.to(pId).emit("conversationUpdated", formattedForParticipant);
        }
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Rời khỏi nhóm thành công"
        }
      };
    } catch (error) {
      console.error("Lỗi rời nhóm:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }

  async disbandGroup(conversationId, userId) {
    try {
      if (!conversationId || !userId) {
        return {
          status: 400,
          data: { success: false, message: "Missing conversationId or userId" }
        };
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return {
          status: 404,
          data: { success: false, message: "Conversation not found" }
        };
      }

      if (conversation.type !== "group") {
        return {
          status: 400,
          data: { success: false, message: "This conversation is not a group" }
        };
      }

      // Check if user is an admin in the group
      const participant = conversation.participants.find(
        (p) => (p.userId?._id?.toString() || p.userId?.toString()) === userId.toString()
      );
      if (!participant || participant.role !== "admin") {
        return {
          status: 403,
          data: { success: false, message: "Only group admins can disband the group" }
        };
      }

      conversation.isDisband = true;
      await conversation.save();

      // Notify all remaining participants via socket
      conversation.participants.forEach((p) => {
        const pId = p.userId?._id?.toString() || p.userId?.toString();
        if (pId) {
          const formatted = this.formatConversation(conversation, pId);
          io.to(pId).emit("conversationUpdated", formatted);
        }
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Group has been disbanded successfully"
        }
      };
    } catch (error) {
      console.error("Lỗi giải tán nhóm:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }

  async reportGroup(conversationId, userId, reason, details, files = []) {
    try {
      if (!conversationId || !userId || !reason) {
        return {
          status: 400,
          data: { success: false, message: "Thiếu thông tin báo cáo" }
        };
      }

      const report = await Report.create({
        reporterId: userId,
        targetId: conversationId,
        targetType: "group",
        reason,
        details,
        file: files
      });

      return {
        status: 200,
        data: {
          success: true,
          message: "Gửi báo cáo thành công",
          report
        }
      };
    } catch (error) {
      console.error("Lỗi gửi báo cáo nhóm:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }

  async searchGroups(query) {
    try {
      const groups = await Conversation.find({
        type: "group",
        "group.name": { $regex: query, $options: "i" }
      }).populate("participants.userId", "_id username full_name profile_picture");
      return {
        status: 200,
        data: { success: true, groups }
      };
    } catch (error) {
      console.error("Lỗi tìm kiếm nhóm:", error);
      return {
        status: 500,
        data: { success: false, message: "Lỗi hệ thống: " + error.message }
      };
    }
  }

  async requestToJoin(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return { status: 404, data: { success: false, message: "Không tìm thấy nhóm" } };
      }
      const isMember = conversation.participants.some(p => p.userId.toString() === userId.toString());
      if (isMember) {
        return { status: 400, data: { success: false, message: "Bạn đã là thành viên của nhóm" } };
      }
      const alreadyRequested = conversation.joinRequests.some(r => r.userId.toString() === userId.toString());
      if (alreadyRequested) {
        return { status: 400, data: { success: false, message: "Yêu cầu tham gia đã được gửi trước đó" } };
      }
      conversation.joinRequests.push({ userId, requestedAt: new Date() });
      await conversation.save();
      return { status: 200, data: { success: true, message: "Gửi yêu cầu tham gia thành công" } };
    } catch (error) {
      console.error("Lỗi gửi yêu cầu tham gia:", error);
      return { status: 500, data: { success: false, message: "Lỗi hệ thống: " + error.message } };
    }
  }

  async approveJoinRequest(conversationId, userId, adminId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return { status: 404, data: { success: false, message: "Không tìm thấy nhóm" } };
      }
      const isAdmin = conversation.participants.some(p => (p.userId?._id?.toString() || p.userId?.toString()) === adminId.toString() && p.role === "admin");
      if (!isAdmin) {
        return { status: 403, data: { success: false, message: "Bạn không có quyền duyệt yêu cầu" } };
      }
      const requestIndex = conversation.joinRequests.findIndex(r => (r.userId?._id?.toString() || r.userId?.toString()) === userId.toString());
      if (requestIndex === -1) {
        return { status: 400, data: { success: false, message: "Không tìm thấy yêu cầu tham gia" } };
      }
      conversation.joinRequests.splice(requestIndex, 1);
      conversation.participants.push({ userId, joinedAt: new Date(), role: "member" });
      await conversation.save();

      const populated = await conversation.populate([
        { path: "participants.userId" },
        { path: "joinRequests.userId" },
        { path: "seenBy" },
        { path: "lastMessage.senderId" },
      ]);
      const formatted = this.formatConversation(populated, adminId);

      populated.participants.forEach((participant) => {
        const pId = participant.userId?._id?.toString() || participant.userId?.toString();
        if (pId) {
          const formattedForParticipant = this.formatConversation(populated, pId);
          io.to(pId).emit("conversationUpdated", formattedForParticipant);
        }
      });

      return { status: 200, data: { success: true, message: "Duyệt yêu cầu thành công", conversation: formatted } };
    } catch (error) {
      console.error("Lỗi duyệt yêu cầu:", error);
      return { status: 500, data: { success: false, message: "Lỗi hệ thống: " + error.message } };
    }
  }

  async rejectJoinRequest(conversationId, userId, adminId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return { status: 404, data: { success: false, message: "Không tìm thấy nhóm" } };
      }
      const isAdmin = conversation.participants.some(p => (p.userId?._id?.toString() || p.userId?.toString()) === adminId.toString() && p.role === "admin");
      if (!isAdmin) {
        return { status: 403, data: { success: false, message: "Bạn không có quyền từ chối yêu cầu" } };
      }
      conversation.joinRequests = conversation.joinRequests.filter(r => (r.userId?._id?.toString() || r.userId?.toString()) !== userId.toString());
      await conversation.save();

      const populated = await conversation.populate([
        { path: "participants.userId" },
        { path: "joinRequests.userId" },
        { path: "seenBy" },
        { path: "lastMessage.senderId" },
      ]);
      const formatted = this.formatConversation(populated, adminId);

      populated.participants.forEach((participant) => {
        const pId = participant.userId?._id?.toString() || participant.userId?.toString();
        if (pId) {
          const formattedForParticipant = this.formatConversation(populated, pId);
          io.to(pId).emit("conversationUpdated", formattedForParticipant);
        }
      });

      return { status: 200, data: { success: true, message: "Từ chối yêu cầu thành công", conversation: formatted } };
    } catch (error) {
      console.error("Lỗi từ chối yêu cầu:", error);
      return { status: 500, data: { success: false, message: "Lỗi hệ thống: " + error.message } };
    }
  }
}

export default new ConversationService();
