import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";
import { useChat } from "../../contexts/ChatContext";
import { getConnectionsList } from "../../services/ConnectionServices";
import { createConversation } from "../../services/ConversationServices";
import { MessageSquare } from "lucide-react";

const OnlineUsers = () => {
  const { onlineUsers } = useSocket();
  const { conversations } = useChat();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchConnections = async () => {
      try {
        const res = await getConnectionsList();
        if (res.success && isMounted) {
          setConnections(res.connections || []);
        }
      } catch (err) {
        console.error("Error fetching connections for online list:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchConnections();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter connections who are online
  const onlineFriends = connections.filter((conn) =>
    onlineUsers.includes(conn._id)
  );

  const handleStartChat = async (friendId) => {
    if (isRedirecting) return;

    // Find if conversation already exists in useChat context
    const existingConv = conversations.find(
      (c) =>
        c.type === "direct" &&
        c.participants.some((p) => p.userId?._id === friendId)
    );

    if (existingConv) {
      navigate(`/messages/${existingConv._id}`);
      return;
    }

    // Otherwise, create a new direct conversation
    try {
      setIsRedirecting(true);
      const res = await createConversation({
        type: "direct",
        memberIds: [friendId],
      });
      if (res.success && res.conversation) {
        navigate(`/messages/${res.conversation._id}`);
      } else {
        navigate(`/messages`);
      }
    } catch (err) {
      console.error("Failed to start chat from online users list:", err);
      navigate(`/messages`);
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 w-full p-4 rounded-md shadow-sm text-xs text-slate-800 dark:text-zinc-100 border border-slate-100 dark:border-zinc-800 transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-[13px] tracking-wide flex items-center gap-2">
          Online Users
          {onlineFriends.length > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </h3>
        <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
          {onlineFriends.length} active
        </span>
      </div>

      <div className="flex flex-col max-h-60 overflow-y-auto no-scrollbar gap-1">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <span className="text-gray-400">Loading online users...</span>
          </div>
        ) : onlineFriends.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No friends online</p>
        ) : (
          onlineFriends.map((user) => (
            <div
              key={user._id}
              onClick={() => navigate(`/profile/${user._id}`)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer active:scale-[0.99] group"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.profile_picture || "/default-avatar.avif"}
                  className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-zinc-800"
                  alt={user.full_name}
                />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-[12px] text-slate-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate">
                  @{user.username}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartChat(user._id);
                }}
                disabled={isRedirecting}
                className="p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-zinc-700 text-slate-400 hover:text-indigo-600 transition disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
