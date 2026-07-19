import React from "react";

const AppearanceSettings = ({ theme, setTheme }) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Theme Selection
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Customize the visual theme of your workspace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => setTheme("light")}
          className={`cursor-pointer border-2 p-4 rounded-2xl flex flex-col gap-2 transition ${
            theme === "light"
              ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/20"
              : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
          }`}
        >
          <div className="h-20 bg-white dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-700 p-2 flex flex-col gap-1.5 shadow-sm">
            <div className="h-2 w-12 bg-slate-200 dark:bg-zinc-700 rounded" />
            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-700/50 rounded" />
            <div className="h-1.5 w-3/4 bg-slate-100 dark:bg-zinc-700/50 rounded" />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300 text-center">
            Light Mode
          </span>
        </div>

        <div
          onClick={() => setTheme("dark")}
          className={`cursor-pointer border-2 p-4 rounded-2xl flex flex-col gap-2 transition ${
            theme === "dark"
              ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/20"
              : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
          }`}
        >
          <div className="h-20 bg-slate-900 dark:bg-zinc-900 rounded-lg border border-slate-800 dark:border-zinc-800 p-2 flex flex-col gap-1.5 shadow-sm">
            <div className="h-2 w-12 bg-slate-800 dark:bg-zinc-800 rounded" />
            <div className="h-1.5 w-full bg-slate-800 dark:bg-zinc-800/50 rounded" />
            <div className="h-1.5 w-3/4 bg-slate-800 dark:bg-zinc-800/50 rounded" />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300 text-center">
            Dark Mode
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
