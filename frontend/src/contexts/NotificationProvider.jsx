import { createContext, useContext, useEffect, useState } from "react";
import { getNotifications } from "../services/NotificationServices";
import { useSocket } from "./SocketContext";

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
      console.log("Nhận lời mời thành công: ", notification);

      setNotifications((prev) => [notification, ...prev]);

      setUnreadCounts((prev) => ({
        ...prev,
        friend: (prev["friend"] || 0) + 1,
      }));
    };

    socket.on("friend:request", handleNewNotification);

    return () => {
      socket.off("friend:request", handleNewNotification);
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
