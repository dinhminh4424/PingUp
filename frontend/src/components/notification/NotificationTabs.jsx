import React from "react";

const NotificationTabs = ({
  tabsArray,
  currentTab,
  setCurrentTab,
  unreadCounts,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-slate-50 py-3 mb-4">
      <div className="bg-white rounded-xl shadow p-1.5 flex max-w-2xl mx-auto overflow-x-auto no-scrollbar gap-1">
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
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer shrink-0 ${
                isTabActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-slate-50"
              }`}
            >
              <IconComponent
                className={`w-4 h-4 ${isTabActive ? "text-white" : "text-gray-500"}`}
              />
              <span>{tab.label}</span>
              {tabCount > 0 && (
                <span
                  className={`rounded-full text-[10px] font-bold px-1.5 py-0.5 ml-1 transition-colors ${
                    isTabActive
                      ? "bg-white text-indigo-600"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationTabs;
