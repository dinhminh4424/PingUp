import React from "react";
import { menuItemsData } from "../assets/assets";
import { NavLink } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";

const MenuItems = ({ setSidebarOpen }) => {
  const { unreadCounts } = useNotification();
  const unreadCount = Object.values(unreadCounts || {}).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <div className="px-6 text-gray-600 dark:text-zinc-400 space-y-1 font-medium">
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `px-3.5 py-3 flex items-center justify-between gap-3 rounded-xl transition-all ${
              isActive
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                : "hover:bg-gray-50 dark:hover:bg-zinc-800 dark:hover:text-white"
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
