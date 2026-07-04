import Conversation from "../models/Conversation.js";

class ConversationService {
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

      const formattedConversations = conversations.map((conv) => {
        const convObj = conv.toObject();
        if (conv.type === "direct") {
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
          convObj.full_name = conv.group?.name || "Group Chat";
          convObj.profile_picture = conv.group?.imageGroup || ""; // Sẽ trống nếu chưa upload ảnh nhóm
          convObj.bio = "Group conversation";
        }
        return convObj;
      });

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

  async getConversationById(id) {
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
        .populate("lastMessage.senderId")
        .sort({ lastMessageAt: -1 });

      return {
        status: 200,
        data: {
          success: true,
          message: "Lấy chi tiết Conversations thành công !!",
          conversation: conversation,
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
}

export default new ConversationService();
