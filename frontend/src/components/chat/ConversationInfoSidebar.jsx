import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { 
  ArrowLeft, BellOff, Pin, UserPlus, Clock, Users, ChevronDown, ChevronRight,
  FileText, Link2, EyeOff, AlertTriangle, Edit2, Trash2, X, Search
} from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import { updateConversation } from "../../services/ConversationServices";

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
  messages = [],
  onConversationUpdate
}) => {
  const { userCurrent } = useAuth();
  const [editGroupName, setEditGroupName] = useState("");
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [collapseMembers, setCollapseMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  const filteredParticipants = conversation?.participants?.filter((p) => {
    if (!p.userId) return false;
    const name = p.userId.full_name || "";
    const username = p.userId.username || "";
    const query = memberSearchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || username.toLowerCase().includes(query);
  });
  // Archive state
  const [showArchive, setShowArchive] = useState(false);
  const [archiveTab, setArchiveTab] = useState("media"); // "media" | "files" | "links"
  const [senderFilter, setSenderFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [collapseCustomization, setCollapseCustomization] = useState(true);
  const { updateCustomization } = useChat();

  const onUpdateTheme = async (type, value) => {
    try {
      await updateCustomization(conversation._id, type, value, undefined);
      toast.success("Đã đổi nền hộp thoại");
    } catch (e) {
      toast.error("Không thể đổi hình nền");
    }
  };

  const onUpdateQuickEmoji = async (emoji) => {
    try {
      await updateCustomization(conversation._id, undefined, undefined, emoji);
      toast.success("Đã đổi emoji nhanh");
    } catch (e) {
      toast.error("Không thể đổi emoji nhanh");
    }
  };

  const [showCustomEmojiPicker, setShowCustomEmojiPicker] = useState(false);

  const handleCustomImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      toast.error("Ảnh nền tự chọn không được vượt quá 800KB!");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateTheme("image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Format date helper (e.g. "Ngày 30 Tháng 6")
  const formatDateGroup = (dateString) => {
    const date = new Date(dateString);
    return `Ngày ${date.getDate()} Tháng ${date.getMonth() + 1}`;
  };

  // 1. Extract shared photos/videos dynamically
  const rawMedia = [];
  messages.forEach((msg) => {
    if (msg.imageUrl && msg.imageUrl.length > 0) {
      msg.imageUrl.forEach((url) => {
        rawMedia.push({
          type: "media",
          url,
          senderId: msg.senderId?._id || msg.senderId,
          sender: msg.senderId?.full_name || "Thành viên",
          createdAt: msg.createdAt
        });
      });
    }
  });

  // 2. Extract shared links dynamically
  const linkRegex = /(https?:\/\/[^\s]+)/gi;
  const rawLinks = [];
  messages.forEach((msg) => {
    if (msg.content) {
      const matches = msg.content.match(linkRegex);
      if (matches) {
        matches.forEach((url) => {
          rawLinks.push({
            type: "link",
            url,
            title: url.replace(/(https?:\/\/)?(www\.)?/, "").split("/")[0],
            senderId: msg.senderId?._id || msg.senderId,
            sender: msg.senderId?.full_name || "Thành viên",
            createdAt: msg.createdAt
          });
        });
      }
    }
  });

  // 3. Files extraction
  const rawFiles = [];
  messages.forEach((msg) => {
    if (msg.files && msg.files.length > 0) {
      msg.files.forEach((file) => {
        rawFiles.push({
          type: "file",
          name: file.name,
          url: file.url,
          size: file.size,
          senderId: msg.senderId?._id || msg.senderId,
          sender: msg.senderId?.full_name || "Thành viên",
          createdAt: msg.createdAt
        });
      });
    }
  });

  // Filter helper
  const filterItems = (items) => {
    return items.filter((item) => {
      // A. Filter by sender
      if (senderFilter !== "all") {
        if (item.senderId !== senderFilter) {
          return false;
        }
      }

      // B. Filter by date
      if (dateFilter !== "all") {
        const itemDate = new Date(item.createdAt);
        const now = new Date();
        if (dateFilter === "today") {
          if (
            itemDate.getDate() !== now.getDate() ||
            itemDate.getMonth() !== now.getMonth() ||
            itemDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        } else if (dateFilter === "week") {
          const diffTime = Math.abs(now - itemDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 7) return false;
        } else if (dateFilter === "month") {
          const diffTime = Math.abs(now - itemDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 30) return false;
        }
      }

      return true;
    });
  };

  const filteredMedia = filterItems(rawMedia);
  const filteredLinks = filterItems(rawLinks);
  const filteredFiles = filterItems(rawFiles);

  // Group by date helper
  const groupItemsByDate = (items) => {
    return items.reduce((acc, item) => {
      const groupKey = formatDateGroup(item.createdAt);
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {});
  };

  const groupedMedia = groupItemsByDate(filteredMedia);
  const groupedLinks = groupItemsByDate(filteredLinks);
  const groupedFiles = groupItemsByDate(filteredFiles);

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
          <span className="font-semibold text-slate-800 text-[16px]">Archive</span>
          <button className="text-sm font-semibold text-slate-700 hover:text-indigo-600 cursor-pointer">
            Select
          </button>
        </div>

        {/* Tabs Row */}
        <div className="flex border-b border-gray-100 bg-[#fafafa]">
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
              {tab === "media" ? "Media" : tab === "files" ? "Files" : "Links"}
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
              <option value={userCurrent?._id}>Tôi</option>
              {conversation?.type === "direct" ? (
                <option value={user?._id}>{user?.full_name}</option>
              ) : (
                conversation?.participants
                  ?.filter((p) => p.userId && p.userId._id !== userCurrent?._id)
                  ?.map((p) => (
                    <option key={p.userId._id} value={p.userId._id}>
                      {p.userId.full_name || p.userId.username}
                    </option>
                  ))
              )}
            </select>
            <ChevronDown className="size-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="flex-1 relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full text-xs font-semibold p-2 pr-6 bg-slate-50 border border-gray-200 rounded-full outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option value="all">Date</option>
              <option value="today">Today</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
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
                          <p className="text-[9px] text-gray-400 mt-0.5">Sent by: {link.sender}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-xs">
              <span>No archived data</span>
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
      <div className="flex items-center gap-3 p-3.5 border-b border-gray-100">
        <button 
          onClick={() => setShowInfoSidebar(false)}
          className="p-1 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer transition flex items-center justify-center size-8"
        >
          <X className="size-5" />
        </button>
        <h3 className="font-semibold text-[15px] text-slate-800 flex-1">Conversation info</h3>
      </div>

      {/* User details */}
      <div className="flex flex-col items-center p-6 border-b-8 border-slate-50">
        <div className="relative mb-3">
          <img
            src={
              conversation?.type === "group"
                ? (conversation?.group?.imageGroup || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=200")
                : (user.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200")
            }
            className="size-20 rounded-full object-cover border border-gray-200"
            alt=""
          />
          {conversation?.type === "group" && (
            <label htmlFor="group-image-upload" className="absolute bottom-0 right-0 p-1.5 bg-white hover:bg-slate-100 rounded-full shadow border border-gray-200 cursor-pointer flex items-center justify-center">
              <Edit2 className="size-3.5 text-slate-500" />
              <input
                type="file"
                id="group-image-upload"
                hidden
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  if (file.size > 10 * 1024 * 1024) {
                    toast.error("Tệp ảnh không được vượt quá 10MB!");
                    return;
                  }
                  try {
                    const updated = await updateConversation(conversation._id, null, file);
                    if (updated.success) {
                      toast.success("Cập nhật ảnh nhóm thành công");
                      if (onConversationUpdate) onConversationUpdate(updated.conversation);
                    }
                  } catch (err) {
                    toast.error("Lỗi cập nhật ảnh nhóm");
                  }
                }}
              />
            </label>
          )}
          {conversation?.type !== "group" && isUserOnline && (
            <span className="absolute bottom-0.5 right-0.5 size-4 bg-emerald-500 border-2 border-white rounded-full"></span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mb-5">
          {isEditingGroupName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className="text-sm font-semibold text-slate-800 border-b border-indigo-600 focus:outline-none px-1 py-0.5 w-40"
                autoFocus
              />
              <button
                onClick={async () => {
                  if (!editGroupName.trim()) return;
                  try {
                    const updated = await updateConversation(conversation._id, editGroupName, null);
                    if (updated.success) {
                      toast.success("Cập nhật tên nhóm thành công");
                      if (onConversationUpdate) onConversationUpdate(updated.conversation);
                      setIsEditingGroupName(false);
                    }
                  } catch (err) {
                    toast.error("Lỗi cập nhật tên nhóm");
                  }
                }}
                className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition cursor-pointer"
              >
                Lưu
              </button>
              <button
                onClick={() => setIsEditingGroupName(false)}
                className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition cursor-pointer"
              >
                Hủy
              </button>
            </div>
          ) : (
            <>
              <span className="font-semibold text-lg text-slate-800">
                {conversation?.type === "group" ? (conversation?.group?.name || "Group Chat") : user.full_name}
              </span>
              {conversation?.type === "group" && (
                <button
                  onClick={() => {
                    setEditGroupName(conversation?.group?.name || "");
                    setIsEditingGroupName(true);
                  }}
                  className="p-1 hover:bg-slate-100 rounded-full transition text-slate-400 cursor-pointer"
                >
                  <Edit2 className="size-3.5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Action buttons row */}
        <div className="grid grid-cols-3 gap-4 w-full">
          <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="size-11 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition">
              <BellOff className="size-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 text-center">Turn off notifications</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="size-11 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition">
              <Pin className="size-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 text-center">Pin conversation</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
            <div className="size-11 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition">
              <UserPlus className="size-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 text-center">Create group chat</span>
          </button>
        </div>
      </div>

     

      {/* Accordion: Ảnh/Video */}
      <div className="border-b border-slate-100">
        <button 
          onClick={() => setCollapseMedia((prev) => !prev)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-800 transition cursor-pointer"
        >
          <span>Photos/Videos</span>
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
              <p className="text-xs text-gray-400 py-2">No shared photos or videos</p>
            )}
            <button 
              onClick={() => {
                setShowArchive(true);
                setArchiveTab("media");
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded transition active:scale-98 cursor-pointer"
            >
              View all
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
          <span>Files</span>
          {collapseFiles ? <ChevronRight className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
        </button>
        {!collapseFiles && (
          <div className="px-4 pb-4">
            {rawFiles.length > 0 ? (
              <>
                {rawFiles.slice(0, 3).map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 py-2 hover:bg-slate-50 rounded transition px-1 cursor-pointer"
                  >
                    <div className="size-9 bg-emerald-50 rounded flex items-center justify-center text-emerald-600">
                      <FileText className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-400">{file.size} • {new Date(file.createdAt).toLocaleDateString()}</p>
                    </div>
                  </a>
                ))}
                <button 
                  onClick={() => {
                    setShowArchive(true);
                    setArchiveTab("files");
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded transition active:scale-98 cursor-pointer mt-2"
                >
                  View all
                </button>
              </>
            ) : (
              <p className="text-xs text-gray-400 py-2">No shared files</p>
            )}
          </div>
        )}
      </div>

      {/* Accordion: Link */}
      <div className="border-b border-slate-100">
        <button 
          onClick={() => setCollapseLinks((prev) => !prev)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-800 transition cursor-pointer"
        >
          <span>Links</span>
          {collapseLinks ? <ChevronRight className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
        </button>
        {!collapseLinks && (
          <div className="px-4 pb-4 space-y-3">
            {rawLinks.length > 0 ? (
              rawLinks.slice(0, 3).map((link, i) => {
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 py-1 hover:bg-slate-50 rounded transition px-1 cursor-pointer"
                  >
                    <div className="size-9 bg-indigo-50 rounded flex items-center justify-center text-indigo-600 mt-0.5">
                      <Link2 className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{link.title}</p>
                      <p className="text-[10px] text-indigo-500 truncate">{link.url}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">{new Date(link.createdAt).toLocaleDateString([], {month: "numeric", day: "numeric"})}</span>
                  </a>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 py-2">No shared links</p>
            )}
            <button 
              onClick={() => {
                setShowArchive(true);
                setArchiveTab("links");
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded transition active:scale-98 cursor-pointer mt-2"
            >
              View all
            </button>
          </div>
        )}
      </div>

      {/* Accordion: Group Members */}
      {conversation?.type === "group" && (
        <div className="border-b border-slate-100">
          <button 
            onClick={() => setCollapseMembers((prev) => !prev)}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-800 transition cursor-pointer"
          >
            <span>Members ({conversation?.participants?.length || 0})</span>
            {collapseMembers ? <ChevronRight className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
          </button>
          {!collapseMembers && (
            <div className="px-4 pb-4">
              {/* Search filter input */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full text-xs p-2 pl-8 bg-slate-50 border border-gray-200 rounded-full outline-none focus:bg-white focus:border-indigo-400 transition"
                />
                <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Members list */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {filteredParticipants && filteredParticipants.length > 0 ? (
                  filteredParticipants.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 py-1 px-1 rounded hover:bg-slate-50 transition">
                      <img
                        src={p.userId?.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                        className="size-8 rounded-full object-cover border border-slate-100 flex-shrink-0"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {p.userId?.full_name || "Thành viên"}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">@{p.userId?.username || "username"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-1 text-center">No members found</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accordion: Tùy chỉnh hộp thoại */}
      <div className="border-b border-slate-100">
        <button 
          onClick={() => setCollapseCustomization((prev) => !prev)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-800 transition cursor-pointer"
        >
          <span>Tùy chỉnh hộp thoại</span>
          {collapseCustomization ? <ChevronRight className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
        </button>
        {!collapseCustomization && (
          <div className="px-4 pb-4 space-y-4">
            {/* 1. Theme Color Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Màu nền</label>
              <div className="flex flex-wrap gap-2 items-center">
                {["#eef0f3", "#e6f2ff", "#fce8e6", "#e6f4ea", "#fef7e0", "#f3e8ff", "#2b2b2b"].map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateTheme("color", color)}
                    style={{ backgroundColor: color }}
                    className={`size-6 rounded-full border cursor-pointer hover:scale-110 active:scale-95 transition ${
                      conversation?.theme?.type === "color" && conversation?.theme?.value === color
                        ? "border-indigo-600 ring-2 ring-indigo-200"
                        : "border-gray-300"
                    }`}
                  />
                ))}
                
                {/* Custom Color Input Picker */}
                <label className="size-6 rounded-full border border-gray-300 bg-gradient-to-tr from-red-400 via-green-400 to-blue-400 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition relative shadow-sm" title="Tự chọn màu">
                  <input
                    type="color"
                    onChange={(e) => onUpdateTheme("color", e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="text-[10px] text-white font-bold">+</span>
                </label>
              </div>
            </div>

            {/* 2. Theme Image Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Hình nền</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=150",
                  "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=150",
                  "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=150",
                  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=150"
                ].map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => onUpdateTheme("image", imgUrl)}
                    className={`aspect-video w-full rounded border overflow-hidden cursor-pointer hover:scale-105 transition ${
                      conversation?.theme?.type === "image" && conversation?.theme?.value === imgUrl
                        ? "border-indigo-600 ring-2 ring-indigo-200"
                        : "border-gray-250"
                    }`}
                  >
                    <img src={imgUrl} className="size-full object-cover" alt="" />
                  </button>
                ))}

                {/* Local Image File Upload Picker */}
                <label className="aspect-video w-full rounded border border-dashed border-gray-300 hover:bg-slate-50 hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer transition select-none" title="Tải ảnh từ máy tính">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageFile}
                    className="hidden"
                  />
                  <span className="text-[14px] text-gray-400 font-bold">+</span>
                  <span className="text-[8px] text-gray-400">Tải ảnh</span>
                </label>
              </div>

              {/* Paste Image URL Input */}
              <input
                type="text"
                placeholder="Hoặc dán URL ảnh nền..."
                className="w-full text-xs p-2 bg-slate-50 border border-gray-200 rounded-md outline-none mt-2 focus:bg-white focus:border-indigo-300 transition"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    onUpdateTheme("image", e.target.value.trim());
                    e.target.value = "";
                  }
                }}
              />
            </div>

            {/* 3. Quick Emoji Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Emoji nhanh</label>
              <div className="flex flex-wrap gap-2 items-center">
                {["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✨", "👋"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onUpdateQuickEmoji(emoji)}
                    className={`size-8 text-lg flex items-center justify-center rounded-lg border cursor-pointer hover:bg-slate-50 active:scale-95 transition ${
                      conversation?.quickEmoji === emoji
                        ? "border-indigo-600 bg-indigo-50/50"
                        : "border-gray-200"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}

                {/* Custom Emoji Picker Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCustomEmojiPicker((prev) => !prev)}
                    className="size-8 text-lg flex items-center justify-center rounded-lg border border-dashed border-gray-300 hover:bg-slate-50 hover:border-gray-400 cursor-pointer transition"
                    title="Tự chọn emoji"
                  >
                    +
                  </button>
                  {showCustomEmojiPicker && (
                    <>
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCustomEmojiPicker(false);
                        }}
                      ></div>
                      <div className="absolute bottom-10 right-0 z-50 shadow-2xl rounded-xl overflow-hidden">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            onUpdateQuickEmoji(emojiData.emoji);
                            setShowCustomEmojiPicker(false);
                          }}
                          previewConfig={{ showPreview: false }}
                          skinTonesDisabled
                          height={280}
                          width={240}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion: Thiết lập bảo mật */}
      <div className="border-b-8 border-slate-50">
        <button 
          onClick={() => setCollapseSecurity((prev) => !prev)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-800 transition cursor-pointer"
        >
          <span>Security settings</span>
          {collapseSecurity ? <ChevronRight className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
        </button>
        {!collapseSecurity && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-slate-600" />
                <div>
                  <p className="text-xs font-medium text-slate-700">Auto delete messages</p>
                  <p className="text-[10px] text-gray-400">Never</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <EyeOff className="size-5 text-slate-600" />
                <span className="text-xs font-medium text-slate-700">Hide chat</span>
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
          <span className="text-sm font-medium">Report</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition w-full text-left cursor-pointer">
          <Trash2 className="size-5" />
          <span className="text-sm font-medium">Delete chat history</span>
        </button>
      </div>
    </div>
  );
};

export default ConversationInfoSidebar;
