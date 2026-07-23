import React from "react";
import { Wrench, Settings, RefreshCw, LogOut, KeyRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Maintenance = () => {
  const { userCurrent, logout } = useAuth();

  const handleReload = () => {
    window.location.href = "/";
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      {/* Glassmorphic Panel */}
      <div className="max-w-md w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 shadow-2xl rounded-2xl p-8 text-center relative z-10 space-y-6">
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {/* Rotating Gears in Background */}
          <Settings className="absolute size-20 text-indigo-600/20 animate-spin-slow" />
          <Settings className="absolute size-12 text-amber-500/40 animate-spin-reverse-slow translate-x-4 -translate-y-4" />
          {/* Main Bounce Icon */}
          <Wrench className="absolute size-10 text-indigo-600 dark:text-indigo-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Hệ thống đang bảo trì
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Chúng tôi đang thực hiện một số nâng cấp quan trạng để cải thiện hiệu năng và tính bảo mật. Hệ thống sẽ sớm hoạt động trở lại bình thường.
          </p>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Lưu ý: Chỉ tài khoản Quản trị viên mới được phép đăng nhập và truy cập hệ thống lúc này.
          </p>
        </div>

        {userCurrent ? (
          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl text-left border border-gray-200/20">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Tài khoản hiện tại</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">{userCurrent.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{userCurrent.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full h-11 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <LogOut className="size-4" />
              Đăng xuất & Đăng nhập Admin
            </button>
            <button
              onClick={handleReload}
              className="w-full text-xs text-gray-500 dark:text-gray-400 hover:underline py-1 font-medium"
            >
              Tải lại trang
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleReload}
              className="w-full h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <KeyRound className="size-4" />
              Đăng nhập Quản trị viên
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
