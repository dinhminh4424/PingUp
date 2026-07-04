import React, { useState } from "react";
import { 
  ArrowLeft, BellOff, Pin, UserPlus, Clock, Users, ChevronDown, ChevronRight,
  FileText, Link2, EyeOff, AlertTriangle, Edit2, Trash2
} from "lucide-react";

const ConversationInfoSidebar = ({
  user,
  conversation,
  isUserOnline,
  sharedMedia,
  showInfoSidebar,
  setShowInfoSidebar,
  collapseMedia,
  setCollapseMedia,
  collapseFiles,
  setCollapseFiles,
  collapseLinks,
  setCollapseLinks,
  collapseSecurity,
  setCollapseSecurity,
  hideChatToggle,
  setHideChatToggle,
  messages = []
}) => {
  // Archive state
  const [showArchive, setShowArchive] = useState(false);
  const [archiveTab, setArchiveTab] = useState("media"); // "media" | "files" | "links"
  const [senderFilter, setSenderFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Format date helper (e.g. "Ngày 30 Tháng 6")
  const formatDateGroup = (dateString) => {
    const date = new Date(dateString);
    return `Ngày ${date.getDate()} Tháng ${date.getMonth() + 1}`;
  };

  // 1. Extract shared photos/videos dynamically
  const mediaMessages = messages.filter(
    (msg) => msg.imageUrl && msg.imageUrl.length > 0
  );

  // Group media by date
  const groupedMedia = mediaMessages.reduce((acc, msg) => {
    const groupKey = formatDateGroup(msg.createdAt);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    msg.imageUrl.forEach((url) => {
      acc[groupKey].push({
        url,
        sender: msg.senderId?.full_name || "Thành viên",
        createdAt: msg.createdAt
      });
    });
    return acc;
  }, {});

  // 2. Extract shared links dynamically
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const linkMessages = messages.filter(
    (msg) => msg.content && linkRegex.test(msg.content)
  );

  const groupedLinks = linkMessages.reduce((acc, msg) => {
    const groupKey = formatDateGroup(msg.createdAt);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    const matches = msg.content.match(linkRegex);
    matches.forEach((url) => {
      acc[groupKey].push({
        url,
        title: url.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0], // Fallback title
        sender: msg.senderId?.full_name || "Thành viên",
        createdAt: msg.createdAt
      });
    });
    return acc;
  }, {});

  // 3. Files extraction (Mock files if no file messages are in DB since we only upload images currently)
  // Let's create mock items matching the screenshot
  const mockFiles = [
    {
      name: "Ảnh màn hình 2026-06-30 lúc ... 5.24.png",
      size: "727 KB",
      createdAt: new Date("2026-06-30T10:00:00Z"),
      sender: "Sanh"
    },
    {
      name: "Báo cáo tiến độ dự án.pdf",
      size: "2.4 MB",
      createdAt: new Date("2026-06-28T14:30:00Z"),
      sender: "Sanh"
    },
    {
      name: "Bài thuyết trình.pptx",
      size: "12.8 MB",
      createdAt: new Date("2026-06-23T09:15:00Z"),
      sender: "Sanh"
    }
  ];

  const groupedFiles = mockFiles.reduce((acc, file) => {
    const groupKey = formatDateGroup(file.createdAt);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(file);
    return acc;
  }, {});

  if (showArchive) {
    // Determine active group data based on tab
    const activeGroupData = 
      archiveTab === "media" ? groupedMedia :
      archiveTab === "files" ? groupedFiles :
      groupedLinks;

    return (
      <div className={`h-full bg-white flex flex-col overflow-hidden z-20 absolute md:static right-0 top-0 shadow-lg md:shadow-none transition-all duration-300 ease-in-out ${
        showInfoSidebar ? "w-80 border-l border-gray-200 opacity-100" : "w-0 opacity-0 overflow-hidden border-l-0"
      }`}>
        {/* Archive Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-gray-100">
          <button 
            onClick={() => setShowArchive(false)}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-600 transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <span className="font-semibold text-slate-800 text-[16px]">Kho lưu trữ</span>
          <button className="text-sm font-semibold text-slate-700 hover:text-indigo-600 cursor-pointer">
            Chọn
          </button>
        </div>

        {/* Tabs Row */}
        <div className="flex border-b border-gray-150 bg-[#fafafa]">
          {["media", "files", "links"].map((tab) => (
            <button
              key={tab}
              onClick={() => setArchiveTab(tab)}
              className={`flex-1 py-3 text-center text-[14px] font-semibold transition-all cursor-pointer border-b-2 ${
                archiveTab === tab 
                  ? "border-indigo-600 text-indigo-600" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "media" ? "Ảnh/Video" : tab === "files" ? "Files" : "Links"}
            </button>
          ))}
        </div>

        {/* Dropdown Filters */}
        <div className="flex gap-2.5 p-3 border-b border-slate-100 bg-white">
          <div className="flex-1 relative">
            <select
              value={senderFilter}
              onChange={(e) => setSenderFilter(e.target.value)}
              className="w-full text-xs font-semibold p-2 pr-6 bg-slate-50 border border-gray-200 rounded-full outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option value="all">Người gửi</option>
              <option value="me">Tôi</option>
              <option value="other">{user?.full_name}</option>
            </select>
            <ChevronDown className="size-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="flex-1 relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full text-xs font-semibold p-2 pr-6 bg-slate-50 border border-gray-200 rounded-full outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option value="all">Ngày gửi</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">Tháng này</option>
            </select>
            <ChevronDown className="size-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Archive List Panel */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-5">
          {Object.keys(activeGroupData).length > 0 ? (
            Object.keys(activeGroupData).map((dateGroup) => (
              <div key={dateGroup} className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-500">{dateGroup}</h4>
                
                {archiveTab === "media" && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {activeGroupData[dateGroup].map((item, idx) => (
                      <div key={idx} className="aspect-square bg-slate-200 rounded overflow-hidden shadow-sm border border-slate-100">
                        <img 
                          src={item.url} 
                          className="size-full object-cover hover:scale-105 transition duration-200 cursor-pointer" 
                          alt="" 
                        />
                      </div>
                    ))}
                  </div>
                )}

                {archiveTab === "files" && (
                  <div className="space-y-2 bg-white rounded-lg p-2.5 shadow-sm border border-slate-100">
                    {activeGroupData[dateGroup].map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-1.5 hover:bg-slate-50 rounded transition px-1 cursor-pointer">
                        <div className="size-9 bg-emerald-50 rounded flex items-center justify-center text-emerald-600">
                          <FileText className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
                          <p className="text-[10px] text-gray-400">{file.size} • {file.sender}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {archiveTab === "links" && (
                  <div className="space-y-2 bg-white rounded-lg p-2.5 shadow-sm border border-slate-100">
                    {activeGroupData[dateGroup].map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-3 py-1.5 hover:bg-slate-50 rounded transition px-1 cursor-pointer"
                      >
                        <div className="size-9 bg-indigo-50 rounded flex items-center justify-center text-indigo-600 mt-0.5">
                          <Link2 className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{link.title}</p>
                          <p className="text-[10px] text-indigo-500 truncate">{link.url}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Gửi bởi: {link.sender}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-xs">
              <span>Không có dữ liệu lưu trữ</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal Sidebar view
  return (
    <div className={`h-full bg-white flex flex-col overflow-y-auto z-20 absolute md:static right-0 top-0 shadow-lg md:shadow-none transition-all duration-300 ease-in-out ${
      showInfoSidebar ? "w-80 border-l border-gray-200 opacity-100" : "w-0 opacity-0 overflow-hidden border-l-0"
    }`}>
      {/* Header of Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-lg text-slate-800 mx-auto">Thông tin hội thoại</h3>
        <button 
          onClick={() => setShowInfoSidebar(false)}
          className="p-1 hover:bg-slate-100 rounded-full md:hidden text-slate-500"
        >
          <ArrowLeft className="size-5" />
        </button>
      </div>

      {/* User details */}
      <div className="flex flex-col items-center p-6 border-b-8 border-slate-50">
        <div className="relative mb-3">
          <img
            src={user.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
            className="size-20 rounded-full object-cover border border-gray-200"
            alt=""
          />
          {isUserOnline && (
            <span className="absolute bottom-0.5 right-0.5 size-4 bg-emerald-500 border-2 border-white rounded-full"></span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mb-5">
          <span className="font-semibold text-lg text-slate-800">{user.full_name}</span>
          <button className="p-1 hover:bg-slate-100 rounded-full transition text-slate-400">
            <Edit2 className="size-3.5" />
          </button>
        </div>

        {/* Action buttons row */}
        <div className="grid grid-cols-3 gap-4 w-full">
          <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="size-11 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition">
              <BellOff className="size-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 text-center">Tắt thông báo</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="size-11 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition">
              <Pin className="size-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 text-center">Ghim hội thoại</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="size-11 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition">
              <UserPlus className="size-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 text-center">Tạo nhóm trò chuyện</span>
          </button>
        </div>
      </div>

     

      {/* Accordion: Ảnh/Video */}
      <div className="border-b border-slate-100">
        <button 
          onClick={() => setCollapseMedia((prev) => !prev)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-800 transition cursor-pointer"
        >
          <span>Ảnh/Video</span>
          {collapseMedia ? <ChevronRight className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
        </button>
        {!collapseMedia && (
          <div className="px-4 pb-4">
            {sharedMedia.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {sharedMedia.slice(0, 8).map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    className="aspect-square w-full object-cover rounded border border-slate-100" 
                    alt="" 
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-2">Không có ảnh hoặc video chia sẻ</p>
            )}
            <button 
              onClick={() => {
                setShowArchive(true);
                setArchiveTab("media");
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded transition active:scale-98 cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>
        )}
      </div>

      {/* Accordion: File */}
      <div className="border-b border-slate-100">
        <button 
          onClick={() => setCollapseFiles((prev) => !prev)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-800 transition cursor-pointer"
        >
          <span>File</span>
          {collapseFiles ? <ChevronRight className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
        </button>
        
      </div>

      {/* Accordion: Link */}
      <div className="border-b border-slate-100">
        <button 
          onClick={() => setCollapseLinks((prev) => !prev)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-800 transition cursor-pointer"
        >
          <span>Link</span>
          {collapseLinks ? <ChevronRight className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
        </button>
       
      </div>

      {/* Accordion: Thiết lập bảo mật */}
      <div className="border-b-8 border-slate-50">
        <button 
          onClick={() => setCollapseSecurity((prev) => !prev)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-800 transition cursor-pointer"
        >
          <span>Thiết lập bảo mật</span>
          {collapseSecurity ? <ChevronRight className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
        </button>
        {!collapseSecurity && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-slate-600" />
                <div>
                  <p className="text-xs font-medium text-slate-700">Tin nhắn tự xóa</p>
                  <p className="text-[10px] text-gray-400">Không bao giờ</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <EyeOff className="size-5 text-slate-600" />
                <span className="text-xs font-medium text-slate-700">Ẩn trò chuyện</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hideChatToggle}
                  onChange={(e) => setHideChatToggle(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone Actions */}
      <div className="flex flex-col py-2 mb-10">
        <button className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition w-full text-left cursor-pointer">
          <AlertTriangle className="size-5" />
          <span className="text-sm font-medium">Báo xấu</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition w-full text-left cursor-pointer">
          <Trash2 className="size-5" />
          <span className="text-sm font-medium">Xóa lịch sử trò chuyện</span>
        </button>
      </div>
    </div>
  );
};

export default ConversationInfoSidebar;
