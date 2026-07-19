import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellOff,
  CheckCheck,
  Loader2,
  Bell,
  MessageSquare,
  Heart,
  UserPlus,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

// Import các API services
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
  updateNotification,
} from "../../services/NotificationServices";

import {
  acceptConnectionRequest,
  rejectConnectionRequest,
} from "../../services/ConnectionServices";

import { useNotification } from "../../contexts/NotificationContext";

// Import extracted components
import NotificationTabs from "../../components/notification/NotificationTabs";
import NotificationItem from "../../components/notification/NotificationItem";

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
    { label: "All", value: "all", icon: Bell },
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
      toast.error("Failed to mark as read");
      console.log("Error: ", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("Mark all as read");
        refreshContext();
      }
    } catch (error) {
      toast.error("Failed to mark all as read");
      console.log("Error: ", error);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation(); // Tránh kích hoạt click vào thẻ

    try {
      const res = await deleteNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.success("Deleted notification");
        refreshContext();
      }
    } catch (error) {
      toast.error("Failed to delete notification");
      console.log("Error: ", error);
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
        toast.success("Accepted friend request successfully!");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to accept friend request",
      );
      console.log("Error: ", err);
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
        toast.success("Rejected friend request");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Rejected friend request failed",
      );
      console.log("Error: ", err);
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

  const filteredNotifications = notifications;
  const unreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen py-10 px-4 bg-slate-50 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white rounded-full text-xs font-semibold px-2.5 py-0.5 animate-pulse shadow-sm shadow-red-100">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Chưa đọc */}
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-md px-4 py-2.5 transition-all active:scale-95 cursor-pointer shadow-sm border ${
                showUnreadOnly
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-100"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-55"
              }`}
            >
              <span>Unread</span>
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
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection (Sticky) */}
        <NotificationTabs
          tabsArray={tabsArray}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          unreadCounts={unreadCounts}
        />

        {error && <p className="text-red-600">{error}</p>}

        {/* Main List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium animate-pulse">
              Loading notifications...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center py-16 flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
              <BellOff className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              No notifications
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              {showUnreadOnly
                ? "Excellent! You have read all notifications."
                : "The current list is empty. New notifications will appear here."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {filteredNotifications.map((n) => (
              <NotificationItem
                key={n._id}
                n={n}
                handleCardClick={handleCardClick}
                handleAcceptRequest={handleAcceptRequest}
                handleRejectRequest={handleRejectRequest}
                handleMarkAsRead={handleMarkAsRead}
                handleDeleteNotification={handleDeleteNotification}
                navigate={navigate}
              />
            ))}
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
              Loading more notifications...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
