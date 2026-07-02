import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  MessageSquare,
  Heart,
  MessageCircle,
  UserPlus,
  UserCheck,
  Info,
  Check,
  Trash2,
  CheckCheck,
  Loader2,
} from "lucide-react";
import moment from "moment";
import "moment/locale/vi"; // Sử dụng tiếng Việt cho hiển thị thời gian
import toast from "react-hot-toast";

// Import các API services
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
  updateNotification,
} from "../services/NotificationServices";

import {
  acceptConnectionRequest,
  rejectConnectionRequest,
} from "../services/ConnectionServices";

import { useNotification } from "../contexts/NotificationContext";

moment.locale("vi");

const Notification = () => {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCounts,
    setUnreadCounts,
    setNotifications,
    fetchNotificationsList: refreshContext,
  } = useNotification();

  const [currentTab, setCurrentTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loaderRef = useRef(null);

  const tabsArray = [
    { label: "Tất cả", value: "all", icon: Bell },
    { label: "Message", value: "message", icon: MessageSquare },
    { label: "Interaction", value: "interaction", icon: Heart },
    { label: "Friend", value: "friend", icon: UserPlus },
    { label: "System", value: "system", icon: Info },
  ];

  const fetchNotificationsList = async (pageNumber = 1, append = false) => {
    try {
      if (pageNumber === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError("");

      const limit = 10;
      const res = await getNotifications(
        pageNumber,
        limit,
        currentTab,
        showUnreadOnly,
      );

      if (res.success) {
        console.log("res.notifications: ", res.notifications);

        if (append) {
          setNotifications((prev) => [...prev, ...(res.notifications || [])]);
        } else {
          setNotifications(res.notifications || []);
        }

        if (res.unreadCounts) {
          setUnreadCounts(res.unreadCounts);
        }

        if (res.pagination) {
          setPage(res.pagination.currentPage);
          setHasMore(res.pagination.hasMore);
        }
      } else {
        if (!append) setNotifications([]);
        setHasMore(false);
      }
    } catch (err) {
      console.warn("Lỗi khi tải thông báo:", err);
      setError("Không thể tải thông báo.");
      if (!append) setNotifications([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotificationsList(1, false);
  }, [currentTab, showUnreadOnly]);

  // Thiết lập Infinite Scroll sử dụng IntersectionObserver
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNotificationsList(page + 1, true);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, page, isLoading, isLoadingMore, currentTab, showUnreadOnly]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await updateNotification(id, { isRead: true });
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        );
        refreshContext();
      }
    } catch (error) {
      toast.error("Không thể đánh dấu đã đọc");
      console.log("Lỗi: ", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("Đã đánh dấu đọc tất cả");
        refreshContext();
      }
    } catch (error) {
      toast.error("Thao tác thất bại");
      console.log("Lỗi: ", error);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation(); // Tránh kích hoạt click vào thẻ

    try {
      const res = await deleteNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.success("Đã xóa thông báo");
        refreshContext();
      }
    } catch (error) {
      toast.error("Không thể xóa thông báo");
      console.log("Lỗi: ", error);
    }
  };

  // Xử lý Đồng ý kết bạn trực tiếp
  const handleAcceptRequest = async (
    e,
    requestId,
    senderId,
    notificationId,
  ) => {
    e.stopPropagation();

    try {
      // 1. Cập nhật trạng thái hành động thông báo thành đã đọc & accepted
      const updateRes = await updateNotification(notificationId, {
        isRead: true,
        action: "accepted",
      });
      if (updateRes.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId
              ? { ...n, isRead: true, action: "accepted" }
              : n,
          ),
        );
        refreshContext();
      }

      // 2. Chấp nhận kết bạn thực tế
      const res = await acceptConnectionRequest(requestId);
      if (res.success) {
        toast.success("Đã đồng ý kết bạn thành công!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Đồng ý kết bạn thất bại");
      console.log("Lỗi: ", err);
    }
  };

  // Xử lý Từ chối kết bạn trực tiếp
  const handleRejectRequest = async (e, requestId, notificationId) => {
    e.stopPropagation();

    try {
      // 1. Cập nhật trạng thái hành động thông báo thành đã đọc & rejected
      const updateRes = await updateNotification(notificationId, {
        isRead: true,
        action: "rejected",
      });
      if (updateRes.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId
              ? { ...n, isRead: true, action: "rejected" }
              : n,
          ),
        );
        refreshContext();
      }

      // 2. Từ chối yêu cầu kết bạn
      const res = await rejectConnectionRequest(requestId);
      if (res.success) {
        toast.success("Đã từ chối lời mời kết bạn");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Từ chối kết bạn thất bại");
      console.log("Lỗi: ", err);
    }
  };

  // Click chuyển trang khi click vào thẻ thông báo
  const handleCardClick = async (notification) => {
    // Đánh dấu đã đọc trước khi chuyển hướng
    if (!notification.isRead) {
      try {
        await updateNotification(notification._id, { isRead: true });
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n,
          ),
        );
        refreshContext();
      } catch (err) {
        console.error("Lỗi khi đánh dấu đọc:", err);
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Định nghĩa Icon & màu sắc cho từng loại thông báo
  const getBadgeConfig = (type) => {
    switch (type) {
      case "message":
        return {
          icon: MessageSquare,
          colorClass: "bg-blue-500 text-white ring-blue-50",
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50",
        };
      case "like_post":
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
  const renderFormattedContent = (notification) => {
    const { sender, content } = notification;
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

  // Kế thừa danh sách từ API đã được lọc và phân trang từ server
  const filteredNotifications = notifications;
  const unreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Thông báo
            </h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white rounded-full text-xs font-semibold px-2.5 py-0.5 animate-pulse shadow-sm shadow-red-100">
                {unreadCount} mới
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Chưa đọc */}
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 transition-all active:scale-95 cursor-pointer shadow-sm border ${
                showUnreadOnly
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-100"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span>Chưa đọc</span>
              {unreadCount > 0 && (
                <span
                  className={`rounded-full text-[10px] font-bold px-1.5 py-0.5 ml-1 transition-colors ${
                    showUnreadOnly
                      ? "bg-white text-indigo-600"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Đánh dấu tất cả đã đọc */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all rounded-xl px-4.5 py-2.5 cursor-pointer shadow-sm shadow-indigo-100/50"
              >
                <CheckCheck className="w-4 h-4" />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection (Sticky) */}
        <div className="sticky top-0 z-10 bg-slate-50 py-3 mb-4">
          <div className="flex border-b border-gray-200 bg-white px-2 rounded-xl shadow-sm border overflow-x-auto no-scrollbar">
            {tabsArray.map((tab) => {
              const IconComponent = tab.icon;
              const isTabActive = currentTab === tab.value;

              // Tính số lượng tương ứng với tab từ state unreadCounts lấy từ database
              let tabCount = 0;
              if (tab.value === "message") {
                tabCount = unreadCounts.message;
              } else if (tab.value === "interaction") {
                tabCount = unreadCounts.interaction;
              } else if (tab.value === "friend") {
                tabCount = unreadCounts.friend;
              } else if (tab.value === "system") {
                tabCount = unreadCounts.system;
              }

              return (
                <button
                  key={tab.value}
                  onClick={() => setCurrentTab(tab.value)}
                  className={`flex items-center gap-2 py-4 px-5 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer relative shrink-0 ${
                    isTabActive
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <IconComponent
                    className={`w-4 h-4 ${isTabActive ? "text-indigo-600" : "text-gray-400"}`}
                  />
                  <span>{tab.label}</span>
                  {tabCount > 0 && (
                    <span className="bg-indigo-600 text-white rounded-full text-[10px] font-bold px-1.5 py-0.5 ml-1">
                      {tabCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {/* Main List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium animate-pulse">
              Đang tải thông báo...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center py-16 flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
              <BellOff className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Không có thông báo
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              {showUnreadOnly
                ? "Tuyệt vời! Bạn đã đọc hết tất cả thông báo rồi."
                : "Danh sách hiện tại trống. Các thông báo mới sẽ xuất hiện tại đây."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {filteredNotifications.map((n) => {
              const badge = getBadgeConfig(n.type);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={n._id}
                  onClick={() => handleCardClick(n)}
                  className={`group relative p-4 flex gap-4 items-start transition-all duration-200 hover:bg-slate-50/50 cursor-pointer ${
                    !n.isRead ? "bg-indigo-50/20" : ""
                  }`}
                >
                  {/* Left: Avatar & Badge */}
                  <div className="relative shrink-0">
                    {n.sender ? (
                      <img
                        src={
                          n.sender.profile_picture ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                        }
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
                                handleAcceptRequest(
                                  e,
                                  n.referenceId,
                                  n.sender?._id,
                                  n._id,
                                )
                              }
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-xs font-semibold text-white rounded-lg shadow-sm shadow-indigo-100 cursor-pointer"
                            >
                              Đồng ý
                            </button>
                            <button
                              onClick={(e) =>
                                handleRejectRequest(e, n.referenceId, n._id)
                              }
                              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 transition text-xs font-semibold text-gray-700 rounded-lg cursor-pointer"
                            >
                              Từ chối
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
                              ? "Đã chấp nhận kết bạn"
                              : "Đã từ chối kết bạn"}
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
                        title="Đánh dấu đã đọc"
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteNotification(e, n._id)}
                      title="Xóa thông báo"
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sentinel div phục vụ tự động Infinite Scroll */}
        <div
          ref={loaderRef}
          className="h-12 flex items-center justify-center mt-6"
        >
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tải thêm thông báo...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
