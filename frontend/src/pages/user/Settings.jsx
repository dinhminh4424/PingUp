import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { User, Bell, Shield, Palette } from "lucide-react";

// Import extracted components
import SettingsSidebar from "../../components/settings/SettingsSidebar";
import AccountSettings from "../../components/settings/AccountSettings";
import NotificationSettings from "../../components/settings/NotificationSettings";
import PrivacySettings from "../../components/settings/PrivacySettings";
import AppearanceSettings from "../../components/settings/AppearanceSettings";

const Settings = () => {
  const { userCurrent } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
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
    <div className="relative h-full overflow-y-auto bg-slate-50 dark:bg-zinc-900 p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 mb-8">
          Manage your account preferences, notifications, and privacy settings.
        </p>

        <div className="flex flex-col md:flex-row gap-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 p-6 transition-colors duration-200">
          {/* Navigation Sidebar */}
          <SettingsSidebar
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="h-px md:h-auto md:w-px bg-slate-100 dark:bg-zinc-800" />

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === "general" && (
              <AccountSettings
                userCurrent={userCurrent}
                messageSaved={messageSaved}
                handleSave={handleSave}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationSettings
                emailNotifications={emailNotifications}
                setEmailNotifications={setEmailNotifications}
                pushNotifications={pushNotifications}
                setPushNotifications={setPushNotifications}
              />
            )}

            {activeTab === "privacy" && (
              <PrivacySettings
                isPrivate={isPrivate}
                setIsPrivate={setIsPrivate}
              />
            )}

            {activeTab === "appearance" && (
              <AppearanceSettings theme={theme} setTheme={setTheme} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
