import React from "react";
import { ArrowLeft, UserPlus, Search, Sidebar, MoreVertical, Info, BellOff, Trash2, ShieldAlert } from "lucide-react";

const ChatHeader = ({
  user,
  currentConversation,
  isUserOnline,
  navigate,
  setShowInfoSidebar,
  showInfoSidebar,
  showMoreMenu,
  setShowMoreMenu,
  error,
}) => {
  return (
    <div className="flex items-center justify-between p-3 px-5 bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/messages")}
          className="p-1.5 hover:bg-slate-100 rounded-full transition active:scale-95 text-slate-600 cursor-pointer"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="relative">
          <img
            src={user.profile_picture || "/default-avatar.avif"}
            className="size-10 rounded-full object-cover border border-gray-100"
            alt=""
          />
          {isUserOnline && (
            <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-[15px] leading-tight">
            {user.full_name}
          </p>
          {currentConversation.type === "direct" ? (
            <p className="text-xs text-gray-500">
              {isUserOnline ? (
                <span className="text-emerald-600 font-medium">
                  Đang hoạt động
                </span>
              ) : (
                "Ngoại tuyến"
              )}
            </p>
          ) : (
            <p className="text-xs text-gray-500">@{user.username}</p>
          )}
        </div>
      </div>

      {/* Header Icons & Toggle Sidebar */}
      <div className="flex items-center gap-1.5">
        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition active:scale-95 cursor-pointer">
          <UserPlus className="size-[20px]" />
        </button>
        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition active:scale-95 cursor-pointer">
          <Search className="size-[20px]" />
        </button>
        <button
          onClick={() => setShowInfoSidebar(!showInfoSidebar)}
          className={`p-2 rounded-full transition active:scale-95 cursor-pointer ${
            showInfoSidebar ? "bg-indigo-50 text-indigo-600" : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <Sidebar className="size-[20px]" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition active:scale-95 cursor-pointer"
          >
            <MoreVertical className="size-[20px]" />
          </button>

          {showMoreMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMoreMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-30 transform origin-top-right transition-all">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowInfoSidebar(true);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <Info className="size-4 text-indigo-500" />
                  <span>Thông tin hội thoại</span>
                </button>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <BellOff className="size-4 text-amber-500" />
                  <span>Tắt thông báo</span>
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                >
                  <Trash2 className="size-4" />
                  <span>Xóa cuộc trò chuyện</span>
                </button>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                >
                  <ShieldAlert className="size-4" />
                  <span>Báo cáo / Chặn</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {error && <p className="bg-red-700">{error}</p>}
    </div>
  );
};

export default ChatHeader;
