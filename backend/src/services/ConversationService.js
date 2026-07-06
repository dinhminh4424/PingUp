import Conversation from "../models/Conversation.js";
import { io } from "../socket/index.js";

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
            { userId: userId, joinedAt: new Date() },
            ...participants,
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
}

export default new ConversationService();
