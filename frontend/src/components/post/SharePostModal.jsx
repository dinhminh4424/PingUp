import React, { useState, useRef } from "react";
import { 
  X, 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  Link as LinkIcon, 
  Users, 
  User, 
  Send,
  LoaderCircle,
  MessageSquare,
  MessageCircle
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { sharePost } from "../../services/PostServices";
import toast from "react-hot-toast";

const SharePostModal = ({ post, onClose, onShare }) => {
  const { userCurrent } = useAuth();
  const [caption, setCaption] = useState("");
  const [sharing, setSharing] = useState(false);
  const messengerScrollRef = useRef(null);

  // Mock friends for Messenger list
  const mockFriends = [
    { id: 1, name: "Phạm Tài", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" },
    { id: 2, name: "CodeGym", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80" },
    { id: 3, name: "✌🏻", avatar: "https://images.unsplash.com/photo-1527983359383-4758693f760c?auto=format&fit=crop&w=100&q=80" },
    { id: 4, name: "Nhóm dom dom", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" },
    { id: 5, name: "Thịt Xiên Bánh Mì", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" },
    { id: 6, name: "Nguyễn Anh Nhật", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" },
    { id: 7, name: "Minh Quân", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80" },
  ];

  const handleShareNow = async () => {
    try {
      setSharing(true);
      const res = await sharePost(post._id, caption);
      if (res.success) {
        toast.success("Đã chia sẻ bài viết lên Feed!");
        if (onShare) onShare(res.post);
        onClose();
      } else {
        toast.error(res.message || "Chia sẻ thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
      toast.error("Lỗi hệ thống khi chia sẻ");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success("Đã sao chép liên kết bài viết!");
  };

  const scrollMessenger = (direction) => {
    if (messengerScrollRef.current) {
      const scrollAmount = 200;
      messengerScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[92vh] border border-gray-150 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 shrink-0">
          <div className="w-8"></div>
          <h2 className="text-xl font-bold text-gray-900 select-none text-center flex-1">
            Chia sẻ
          </h2>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
          
          {/* Post to feed section */}
          <div className="space-y-4">
            {/* User header info */}
            <div className="flex items-center gap-3">
              <img 
                src={userCurrent?.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
                alt="" 
                className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200"
              />
              <div className="space-y-1">
                <span className="font-bold text-gray-900 block text-sm">
                  {userCurrent?.full_name || "Đinh Minh"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold select-none">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md hover:bg-gray-200 cursor-pointer">
                    Bảng feed
                  </span>
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md hover:bg-gray-200 cursor-pointer">
                    <Globe size={12} />
                    <span>Công khai</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption Input */}
            <div className="relative">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Hãy nói gì đó về nội dung này..."
                className="w-full min-h-[90px] p-3 text-sm border-none bg-gray-50 rounded-xl outline-none resize-none placeholder-gray-400 text-gray-800 focus:bg-gray-100/70 transition-all"
              />
            </div>

            {/* Share to Feed Button */}
            <div className="flex justify-end">
              <button
                onClick={handleShareNow}
                disabled={sharing}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:bg-blue-400"
              >
                {sharing ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Đang chia sẻ...
                  </>
                ) : (
                  "Chia sẻ ngay"
                )}
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section: Send via Messenger (Future feature) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center select-none">
              <h3 className="font-bold text-gray-900 text-sm">Gửi bằng Messenger <span className="text-xs text-blue-500 font-normal">[tương lai]</span></h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => scrollMessenger("left")}
                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={() => scrollMessenger("right")}
                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Messenger Horizonal scroll list */}
            <div 
              ref={messengerScrollRef}
              className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1 select-none"
            >
              {mockFriends.map((friend) => (
                <div 
                  key={friend.id}
                  onClick={() => toast("Tính năng gửi Messenger sẽ sớm ra mắt!", { icon: "💬" })}
                  className="flex flex-col items-center text-center gap-1.5 shrink-0 w-16 group cursor-pointer"
                >
                  <div className="relative">
                    <img 
                      src={friend.avatar} 
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700 truncate w-full group-hover:text-blue-600 transition-colors">
                    {friend.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section: Share to (Social Apps) */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-sm select-none">Chia sẻ lên</h3>
            
            <div className="grid grid-cols-6 gap-2 py-1 select-none">
              {/* Messenger */}
              <button 
                onClick={() => toast("Tính năng chia sẻ ứng dụng đang phát triển!", { icon: "⚡" })}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full flex items-center justify-center shadow-sm transition-all group-hover:scale-105">
                  <MessageCircle size={22} fill="currentColor" className="text-white" />
                </div>
                <span className="text-[10px] text-gray-600 font-semibold group-hover:text-gray-900 text-center leading-tight">
                  Messenger
                </span>
              </button>

              {/* WhatsApp */}
              <button 
                onClick={() => toast("Tính năng chia sẻ ứng dụng đang phát triển!", { icon: "⚡" })}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-green-50 text-green-500 hover:bg-green-100 rounded-full flex items-center justify-center shadow-sm transition-all group-hover:scale-105">
                  <MessageSquare size={22} />
                </div>
                <span className="text-[10px] text-gray-600 font-semibold group-hover:text-gray-900 text-center leading-tight">
                  WhatsApp
                </span>
              </button>

              {/* Copy Link */}
              <button 
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full flex items-center justify-center shadow-sm transition-all group-hover:scale-105">
                  <LinkIcon size={22} />
                </div>
                <span className="text-[10px] text-gray-600 font-semibold group-hover:text-gray-900 text-center leading-tight">
                  Sao chép liên kết
                </span>
              </button>

              {/* Group */}
              <button 
                onClick={() => toast("Tính năng chia sẻ nhóm đang phát triển!", { icon: "⚡" })}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-650 hover:bg-indigo-100 rounded-full flex items-center justify-center shadow-sm transition-all group-hover:scale-105">
                  <Users size={22} />
                </div>
                <span className="text-[10px] text-gray-600 font-semibold group-hover:text-gray-900 text-center leading-tight">
                  Nhóm
                </span>
              </button>

              {/* Friend's Profile */}
              <button 
                onClick={() => toast("Tính năng chia sẻ lên trang cá nhân bạn bè đang phát triển!", { icon: "⚡" })}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-full flex items-center justify-center shadow-sm transition-all group-hover:scale-105">
                  <User size={22} />
                </div>
                <span className="text-[10px] text-gray-600 font-semibold group-hover:text-gray-900 text-center leading-tight">
                  Trang cá nhân của bạn bè
                </span>
              </button>

              {/* X / Twitter */}
              <button 
                onClick={() => toast("Tính năng chia sẻ ứng dụng đang phát triển!", { icon: "⚡" })}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gray-100 text-black hover:bg-gray-200 rounded-full flex items-center justify-center shadow-sm transition-all group-hover:scale-105 font-bold text-lg select-none">
                  𝕏
                </div>
                <span className="text-[10px] text-gray-600 font-semibold group-hover:text-gray-900 text-center leading-tight">
                  X
                </span>
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SharePostModal;
