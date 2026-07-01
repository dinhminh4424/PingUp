import { createContext, useContext, useEffect, useState } from "react";
import { getNotifications } from "../services/NotificationServices";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
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
      const res = await getNotifications(1, limit, "all", true);

      if (res.success) {
        console.log("res.notifications: ", res.notifications);

        if (res.unreadCounts) {
          setUnreadCounts(res.unreadCounts);
        }
      }
    } catch (err) {
      console.warn("Lỗi khi tải thông báo:", err);
    }
  };

  useEffect(() => {
    fetchNotificationsList();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCounts, setUnreadCounts, setNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
