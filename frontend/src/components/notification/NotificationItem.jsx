import React from "react";
import {
  Bell,
  Check,
  Trash2,
  MessageSquare,
  HeartOff,
  Heart,
  MessageCircle,
  UserCheck,
  UserX,
  UserPlus,
  Info,
} from "lucide-react";
import moment from "moment";

const NotificationItem = ({
  n,
  handleCardClick,
  handleAcceptRequest,
  handleRejectRequest,
  handleMarkAsRead,
  handleDeleteNotification,
  navigate,
}) => {
  // Định nghĩa Icon & màu sắc cho từng loại thông báo
  const getBadgeConfig = (notif) => {
    const type = notif.type;
    const action = notif.action;

    switch (type) {
      case "message":
        return {
          icon: MessageSquare,
          colorClass: "bg-blue-500 text-white ring-blue-50",
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50",
        };
      case "like_post":
      case "like_comment":
        if (notif.detailType === "unlike") {
          return {
            icon: HeartOff,
            colorClass: "bg-gray-400 text-white ring-gray-50",
            iconColor: "text-gray-400",
            bgColor: "bg-gray-50",
          };
        }
        return {
          icon: Heart,
          colorClass: "bg-rose-500 text-white ring-rose-50",
          iconColor: "text-rose-500",
          bgColor: "bg-rose-50",
        };
      case "comment_post":
        return {
          icon: MessageCircle,
          colorClass: "bg-emerald-500 text-white ring-emerald-50",
          iconColor: "text-emerald-500",
          bgColor: "bg-emerald-50",
        };
      case "reply_comment":
        return {
          icon: MessageCircle,
          colorClass: "bg-cyan-500 text-white ring-cyan-50",
          iconColor: "text-cyan-500",
          bgColor: "bg-cyan-50",
        };
      case "friend_request":
        if (action === "accepted") {
          return {
            icon: UserCheck,
            colorClass: "bg-emerald-500 text-white ring-emerald-50",
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50",
          };
        }
        if (action === "rejected") {
          return {
            icon: UserX,
            colorClass: "bg-rose-500 text-white ring-rose-50",
            iconColor: "text-rose-500",
            bgColor: "bg-rose-50",
          };
        }
        return {
          icon: UserPlus,
          colorClass: "bg-amber-500 text-white ring-amber-50",
          iconColor: "text-amber-500",
          bgColor: "bg-amber-50",
        };
      case "friend_accept":
        return {
          icon: UserCheck,
          colorClass: "bg-indigo-500 text-white ring-indigo-50",
          iconColor: "text-indigo-500",
          bgColor: "bg-indigo-50",
        };
      case "system":
      default:
        return {
          icon: Info,
          colorClass: "bg-slate-600 text-white ring-slate-100",
          iconColor: "text-slate-600",
          bgColor: "bg-slate-100",
        };
    }
  };

  // Định dạng in đậm tên người gửi trong nội dung thông báo
  const renderFormattedContent = (notif) => {
    const { sender, content } = notif;
    if (!sender) {
      return <span className="text-gray-700 font-medium">{content}</span>;
    }

    const name = sender.full_name || sender.username;
    if (content.startsWith(name)) {
      const rest = content.slice(name.length);
      return (
        <span className="text-gray-700">
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${sender._id}`);
            }}
            className="font-bold text-gray-900 hover:underline hover:text-indigo-600 transition-colors"
          >
            {name}
          </span>
          {rest}
        </span>
      );
    }

    return <span className="text-gray-700">{content}</span>;
  };

  const badge = getBadgeConfig(n);
  const BadgeIcon = badge.icon;

  return (
    <div
      onClick={() => handleCardClick(n)}
      className={`group relative p-4 flex gap-4 items-start transition-all duration-200 hover:bg-slate-50/50 cursor-pointer ${
        !n.isRead ? "bg-indigo-50/20" : ""
      }`}
    >
      {/* Left: Avatar & Badge */}
      <div className="relative shrink-0">
        {n.sender ? (
          <img
            src={n.sender.profile_picture || "/default-avatar.avif"}
            alt={n.sender.full_name}
            className="w-12 h-12 rounded-full object-cover shadow-sm ring-1 ring-gray-100"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm ring-1 ring-gray-100">
            <Bell className="w-5 h-5" />
          </div>
        )}

        {/* Badge Icon cho từng loại */}
        <div
          className={`absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm ${badge.colorClass}`}
        >
          <BadgeIcon className="w-3 h-3" />
        </div>
      </div>

      {/* Middle: Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm leading-relaxed pr-6">
            {renderFormattedContent(n)}
          </div>

          {/* Trạng thái chưa đọc (chấm xanh) */}
          {!n.isRead && (
            <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2"></div>
          )}
        </div>

        {/* Subtext: Time */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400 font-medium">
            {moment(n.createdAt).fromNow()}
          </span>
        </div>

        {/* Khối nút Hành động đặc thù (Loại friend_request) */}
        {n.type === "friend_request" && n.referenceId && (
          <div className="mt-3 flex items-center gap-2">
            {n.action === "none" || !n.action ? (
              <>
                <button
                  onClick={(e) =>
                    handleAcceptRequest(e, n.referenceId, n.sender?._id, n._id)
                  }
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-xs font-semibold text-white rounded-lg shadow-sm shadow-indigo-105 cursor-pointer"
                >
                  Agree
                </button>
                <button
                  onClick={(e) => handleRejectRequest(e, n.referenceId, n._id)}
                  className="px-4 py-1.5 bg-slate-105 hover:bg-slate-200 active:scale-95 transition text-xs font-semibold text-gray-700 rounded-lg cursor-pointer"
                >
                  Reject
                </button>
              </>
            ) : (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md ${
                  n.action === "accepted"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-slate-50 text-gray-500 border border-slate-100"
                }`}
              >
                {n.action === "accepted"
                  ? "Accepted friend request"
                  : "Rejected friend request"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: Quick actions (Delete / Mark read) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5">
        {!n.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(n._id);
            }}
            title="Mark as read"
            className="p-1.5 text-gray-400 hover:text-indigo-605 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => handleDeleteNotification(e, n._id)}
          title="Delete notification"
          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
