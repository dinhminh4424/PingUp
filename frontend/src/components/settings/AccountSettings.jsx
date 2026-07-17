import React from "react";
import { CheckCircle } from "lucide-react";

const AccountSettings = ({ userCurrent, messageSaved, handleSave }) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Account Info
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Update your basic profile information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            defaultValue={userCurrent?.full_name || ""}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            Username
          </label>
          <input
            type="text"
            defaultValue={userCurrent?.username || ""}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            defaultValue={userCurrent?.email || ""}
            disabled
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 text-sm cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 transition active:scale-95 cursor-pointer flex items-center gap-2"
        >
          {messageSaved ? <CheckCircle className="w-4 h-4" /> : null}
          {messageSaved ? "Saved Successfully" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
