import React, { useState, useEffect } from "react";
import { menuItemsData } from "../assets/assets";
import { NavLink } from "react-router-dom";
import { useNotification } from "../contexts/NotificationProvider";

const MenuItems = ({ setSidebarOpen }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { unreadCounts } = useNotification();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const total = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

        console.log("Minh: ", unreadCounts);

        setUnreadCount(total);
      } catch (error) {
        console.warn("Không thể lấy số lượng thông báo chưa đọc:", error);
      }
    };

    fetchUnreadCount();

    window.addEventListener("notification_updated", fetchUnreadCount);
    const interval = setInterval(fetchUnreadCount, 15000); // Thống kê định kỳ mỗi 15 giây

    return () => {
      window.removeEventListener("notification_updated", fetchUnreadCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="px-6 text-gray-600 space-y-1 font-medium">
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `px-3.5 py-3 flex items-center justify-between gap-3 rounded-xl transition-all ${
              isActive ? "bg-indigo-50 text-indigo-700 " : "hover:bg-gray-50"
            }`
          }
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </div>
          {label === "Notification" && unreadCount > 0 && (
            <span className="bg-rose-500 text-white rounded-full text-[10px] font-bold w-5 h-5 flex items-center justify-center shadow-sm shadow-rose-100 animate-pulse">
              {unreadCount}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default MenuItems;
