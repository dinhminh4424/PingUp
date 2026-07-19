import React from "react";

const SettingsSidebar = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full md:w-64 flex flex-col gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
              activeTab === tab.id
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm shadow-indigo-105/50 dark:shadow-none"
                : "text-gray-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SettingsSidebar;
