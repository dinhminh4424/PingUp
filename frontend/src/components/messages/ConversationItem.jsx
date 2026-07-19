import React from "react";
import { Users, MessageSquare, Eye } from "lucide-react";

const ConversationItem = ({ conver, userCurrent, onlineUsers, navigate }) => {
  const unreadCount =
    conver.unreadCount?.[userCurrent?._id] ||
    conver.unReadCount?.[userCurrent?._id] ||
    0;

  const renderConversationAvatar = () => {
    if (conver.type === "direct") {
      const user = conver.participants?.find(
        (p) => p.userId && p.userId._id !== userCurrent?._id,
      )?.userId;

      const isOnline = user && onlineUsers.includes(user._id);
      const avatarSrc = user?.profile_picture || "/default-avatar.avif";

      return (
        <div className="relative flex-shrink-0 w-12 h-12">
          <img
            src={avatarSrc}
            className="rounded-full w-12 h-12 object-cover border border-gray-100"
            alt=""
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-10"></span>
          )}
        </div>
      );
    }

    // Nếu là nhóm chat và đã tải lên ảnh đại diện nhóm
    if (conver.type === "group" && conver.profile_picture) {
      return (
        <img
          src={conver.profile_picture}
          className="rounded-full size-12 object-cover border border-gray-100 flex-shrink-0"
          alt=""
        />
      );
    }

    // Group chat avatar: overlapping members
    const activeParticipants = conver.participants || [];
    const displayedParticipants = activeParticipants.slice(0, 3);

    return (
      <div className="relative w-12 h-12 flex-shrink-0">
        {displayedParticipants.map((p, idx) => {
          const user = p.userId;
          if (!user) return null;

          let posClass =
            "absolute size-7 rounded-full border-2 border-white object-cover shadow-sm ";
          if (idx === 0) posClass += "z-30 left-0 top-0";
          else if (idx === 1) posClass += "z-20 left-2.5 top-2";
          else if (idx === 2) posClass += "z-10 left-5 top-4";

          return (
            <img
              key={user._id}
              src={user.profile_picture || "/default-avatar.avif"}
              className={posClass}
              alt=""
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`flex gap-4 p-5 bg-white dark:bg-zinc-900 shadow rounded-md border transition ${
        unreadCount > 0
          ? "border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-50/50 dark:ring-indigo-900/40 shadow-md"
          : "border-gray-100 dark:border-zinc-800 hover:shadow-md"
      }`}
    >
      {renderConversationAvatar()}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 dark:text-zinc-100 truncate flex items-center gap-1.5">
          {conver.type === "group" && (
            <Users className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          )}
          {conver.full_name}
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </p>
        <p className="text-slate-500 dark:text-zinc-400 text-sm truncate">
          {conver.type === "direct"
            ? `@${conver.username}`
            : `${conver.participants?.length || 0} members`}
        </p>
        <p
          className={`text-xs mt-1 truncate ${unreadCount > 0 ? "text-indigo-600 font-semibold" : "text-gray-400"}`}
        >
          {conver.lastMessage?.content || conver.bio || "No messages yet"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/messages/${conver._id}`)}
          className="size-10 flex items-center justify-center text-sm rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 active:scale-95 transition cursor-pointer"
          title="Chat"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        {conver.type === "direct" && (
          <button
            onClick={() =>
              navigate(`/profile/${conver.targetUserId || conver._id}`)
            }
            className="size-10 flex items-center justify-center text-sm rounded bg-slate-50 hover:bg-slate-100 text-slate-600 active:scale-95 transition cursor-pointer"
            title="Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ConversationItem;
