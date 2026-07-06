import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";

const ResentMessages = () => {
  const { conversations } = useChat();
  const { userCurrent } = useAuth();

  console.log("conversations: ", conversations);

  const getConversationDetails = (conver) => {
    if (!conver) return null;
    if (conver.type === "direct") {
      const otherUser = conver.participants.find(
        (p) => p.userId?._id !== userCurrent?._id,
      );
      return {
        name: otherUser?.userId?.full_name || "Direct chat",
        avatar:
          otherUser?.userId?.profile_picture ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100",
      };
    } else {
      return {
        name: conver.group?.name || "Group chat",
        avatar:
          conver.group?.imageGroup ||
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=100",
      };
    }
  };

  return (
    <div className="bg-white w-full p-4 rounded-md shadow-sm text-xs text-slate-800 border border-slate-100">
      <h3 className="font-bold text-slate-800 mb-3 text-[13px] tracking-wide">
        Resent Messages
      </h3>
      <div className="flex flex-col max-h-60 overflow-y-auto no-scrollbar gap-1">
        {conversations.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No messages</p>
        ) : (
          conversations.map((conversation, index) => {
            const details = getConversationDetails(conversation);
            if (!details) return null;

            const unreadCount =
              conversation.unReadCount?.[userCurrent?._id] || 0;

            return (
              <Link
                key={conversation._id || index}
                to={`/messages/${conversation._id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition active:scale-[0.99]"
              >
                <img
                  src={details.avatar}
                  className="w-9 h-9 rounded-full object-cover border border-slate-100 flex-shrink-0"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-1">
                    <p
                      className={`font-semibold truncate text-[12px] ${unreadCount > 0 ? "text-slate-900" : "text-slate-700"}`}
                    >
                      {details.name}
                    </p>
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">
                      {conversation.lastMessageAt
                        ? moment(conversation.lastMessageAt).fromNow(true)
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p
                      className={`text-[11px] truncate flex-1 pr-2 ${unreadCount > 0 ? "text-indigo-600 font-medium" : "text-gray-500"}`}
                    >
                      {conversation.lastMessage
                        ? conversation.lastMessage.content || "Attachment"
                        : "You started a chat"}
                    </p>
                    {unreadCount > 0 && (
                      <span className="bg-indigo-600 text-white min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ResentMessages;
