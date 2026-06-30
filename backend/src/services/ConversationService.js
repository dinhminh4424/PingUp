class ConversationService {
  async createConversation(type, name, memberIds) {
    try {
      let conversation;
      let participants = memberIds.map((memberId) => {
        return {
          userId: memberId,
          joinedAt: new Date(),
        };
      });

      if (type === "direct") {
        conversation = await Conversation.findOne({
          type: "direct",
          "participants.userId": { $all: [userId, memberIds] },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            type: "direct",
            participants: [
              { userId: userId, joinedAt: new Date() },
              ...participants,
            ],
            lastMessageAt: new Date(),
          });
        }
      }
      if (type === "group") {
        let group = {
          name: name,
          createBy: userId,
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
        return res.status(400).json({
          success: false,
          message: "Lỗi  khi tạo hộp thoại mới: ",
        });
      }

      await conversation.populate([
        { path: "participants.userId" },
        { path: "seenBy" },
        { path: "lastMessage.senderId" },
      ]);

      return {
        status: 200,
        data: {
          success: true,
          message: "Tạo hộp thoại mới thành công",
          conversation: formatted,
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
