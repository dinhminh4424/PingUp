import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { User, Bell, Shield, Eye, Palette, CheckCircle, HelpCircle } from "lucide-react";

const Settings = () => {
  const { userCurrent } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [theme, setTheme] = useState("light");
  const [messageSaved, setMessageSaved] = useState(false);

  const handleSave = () => {
    setMessageSaved(true);
    setTimeout(() => setMessageSaved(false), 3000);
  };

  const tabs = [
    { id: "general", label: "Account Settings", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="relative h-full overflow-y-auto bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500 mb-8">Manage your account preferences, notifications, and privacy settings.</p>

        <div className="flex flex-col md:flex-row gap-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                      : "text-gray-600 hover:bg-slate-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-px md:h-auto md:w-px bg-slate-100" />

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === "general" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Account Info</h3>
                  <p className="text-sm text-gray-500">Update your basic profile information.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      defaultValue={userCurrent?.full_name || ""}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      defaultValue={userCurrent?.username || ""}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      defaultValue={userCurrent?.email || ""}
                      disabled
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
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
            )}

            {activeTab === "notifications" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h3>
                  <p className="text-sm text-gray-500">Choose how and when you receive updates.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-gray-900">Email Notifications</span>
                      <span className="text-xs text-gray-500">Get updates on new connections, reports, and direct messages in your inbox.</span>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        emailNotifications ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          emailNotifications ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-gray-900">Push Notifications</span>
                      <span className="text-xs text-gray-500">Receive real-time notifications on your desktop or mobile device.</span>
                    </div>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        pushNotifications ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          pushNotifications ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Privacy & Security</h3>
                  <p className="text-sm text-gray-500">Control who sees your content and lock down your account security.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-gray-900">Private Profile</span>
                      <span className="text-xs text-gray-500">Only approved connections will be able to see your feed and posts.</span>
                    </div>
                    <button
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isPrivate ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isPrivate ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Theme Selection</h3>
                  <p className="text-sm text-gray-500">Customize the visual theme of your workspace.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setTheme("light")}
                    className={`cursor-pointer border-2 p-4 rounded-2xl flex flex-col gap-2 transition ${
                      theme === "light" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="h-20 bg-white rounded-lg border border-slate-100 p-2 flex flex-col gap-1.5 shadow-sm">
                      <div className="h-2 w-12 bg-slate-200 rounded" />
                      <div className="h-1.5 w-full bg-slate-100 rounded" />
                      <div className="h-1.5 w-3/4 bg-slate-100 rounded" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 text-center">Light Mode</span>
                  </div>

                  <div
                    onClick={() => setTheme("dark")}
                    className={`cursor-pointer border-2 p-4 rounded-2xl flex flex-col gap-2 transition ${
                      theme === "dark" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="h-20 bg-slate-900 rounded-lg border border-slate-800 p-2 flex flex-col gap-1.5 shadow-sm">
                      <div className="h-2 w-12 bg-slate-800 rounded" />
                      <div className="h-1.5 w-full bg-slate-800 rounded" />
                      <div className="h-1.5 w-3/4 bg-slate-800 rounded" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 text-center">Dark Mode (Coming Soon)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
