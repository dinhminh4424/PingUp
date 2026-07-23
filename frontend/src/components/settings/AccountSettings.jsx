import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

const AccountSettings = ({ userCurrent, onSave }) => {
  const [fullName, setFullName] = useState(userCurrent?.full_name || "");
  const [username, setUsername] = useState(userCurrent?.username || "");
  const [saving, setSaving] = useState(false);
  const [messageSaved, setMessageSaved] = useState(false);

  useEffect(() => {
    if (userCurrent) {
      setFullName(userCurrent.full_name || "");
      setUsername(userCurrent.username || "");
    }
  }, [userCurrent]);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      return;
    }
    if (!username.trim()) {
      return;
    }
    setSaving(true);
    const success = await onSave({ full_name: fullName, username });
    setSaving(false);
    if (success) {
      setMessageSaved(true);
      setTimeout(() => setMessageSaved(false), 3000);
    }
  };

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
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            value={userCurrent?.email || ""}
            disabled
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 text-sm cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 transition active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : messageSaved ? (
            <CheckCircle className="w-4 h-4" />
          ) : null}
          {saving
            ? "Saving Changes..."
            : messageSaved
            ? "Saved Successfully"
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
