import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { User, Bell, Shield, Palette } from "lucide-react";
import toast from "react-hot-toast";
import { updatePrivacySettings, updateInfoUser } from "../../services/UserServices";

// Import extracted components
import SettingsSidebar from "../../components/settings/SettingsSidebar";
import AccountSettings from "../../components/settings/AccountSettings";
import NotificationSettings from "../../components/settings/NotificationSettings";
import PrivacySettings from "../../components/settings/PrivacySettings";
import AppearanceSettings from "../../components/settings/AppearanceSettings";

const Settings = () => {
  const { userCurrent, updateCurrentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isPrivate, setIsPrivate] = useState(userCurrent?.isPrivate || false);

  useEffect(() => {
    if (userCurrent) {
      setIsPrivate(userCurrent.isPrivate || false);
    }
  }, [userCurrent]);

  const handlePrivacyToggle = async (newVal) => {
    setIsPrivate(newVal);
    try {
      const res = await updatePrivacySettings(newVal);
      if (res.success) {
        updateCurrentUser({ isPrivate: newVal });
        toast.success("Cập nhật quyền riêng tư thành công!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật quyền riêng tư:", error);
      toast.error("Không thể lưu cấu hình quyền riêng tư.");
      setIsPrivate(!newVal); // Rollback
    }
  };

  const handleSaveAccountInfo = async (accountData) => {
    try {
      const updatedUser = await updateInfoUser(accountData);
      if (updatedUser) {
        updateCurrentUser(updatedUser);
        toast.success("Cập nhật thông tin tài khoản thành công!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi cập nhật thông tin tài khoản:", error);
      toast.error(error.response?.data?.message || "Cập nhật tài khoản thất bại.");
      return false;
    }
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
                onSave={handleSaveAccountInfo}
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
                setIsPrivate={handlePrivacyToggle}
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
