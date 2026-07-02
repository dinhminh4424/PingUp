import { createContext, useContext, useEffect, useState } from "react";
import { getNotifications } from "../services/NotificationServices";
import { useSocket } from "./SocketContext";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState([]);

  const [unreadCounts, setUnreadCounts] = useState({
    message: 0,
    interaction: 0,
    friend: 0,
    system: 0,
  });

  const fetchNotificationsList = async () => {
    try {
      const limit = 10;
      const res = await getNotifications(1, limit, "all", false);

      if (res.success) {
        setNotifications(res.notifications || []);
        if (res.unreadCounts) {
          setUnreadCounts(res.unreadCounts);
        }
      }
    } catch (err) {
      console.warn("Lỗi khi tải thông báo:", err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      console.log("Nhận thông báo mới từ socket: ", notification);

      // Hiển thị toast thông báo
      toast(notification.content || "Bạn có thông báo mới!", {
        icon: "🔔",
        duration: 4000,
        style: {
          borderRadius: "12px",
          background: "#fff",
          color: "#333",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
      });

      // Cập nhật danh sách thông báo cục bộ
      setNotifications((prev) => [notification, ...prev]);

      // Cập nhật số lượng chưa đọc cục bộ theo phân loại
      let category = "";
      if (notification.type === "message") {
        category = "message";
      } else if (["like_post", "comment_post", "reply_comment"].includes(notification.type)) {
        category = "interaction";
      } else if (["friend_request", "friend_accept"].includes(notification.type)) {
        category = "friend";
      } else if (notification.type === "system") {
        category = "system";
      }

      if (category) {
        setUnreadCounts((prev) => ({
          ...prev,
          [category]: (prev[category] || 0) + 1,
        }));
      }
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    fetchNotificationsList();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCounts,
        setUnreadCounts,
        setNotifications,
        fetchNotificationsList,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
