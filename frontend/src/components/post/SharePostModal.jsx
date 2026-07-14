import React, { useState, useRef, useEffect } from "react";
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
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { sharePost } from "../../services/PostServices";
import { getConversations } from "../../services/ConversationServices";
import { sendMessage as sendMessageApi } from "../../services/MessageServices";
import toast from "react-hot-toast";

const SharePostModal = ({ post, onClose, onShare }) => {
  const { userCurrent } = useAuth();
  const { onlineUsers } = useSocket();
  const [caption, setCaption] = useState("");
  const [sharing, setSharing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [msgText, setMsgText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const messengerScrollRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const res = await getConversations();
        setConversations(res.conversations || []);
      } catch (error) {
        console.error("Lỗi khi tải hộp thoại trong SharePostModal:", error);
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, []);

  const getConversationDetails = (conver) => {
    if (conver.type === "direct") {
      const otherParticipant = conver.participants?.find(
        (p) => p.userId && p.userId._id !== userCurrent?._id,
      )?.userId;
      return {
        name: otherParticipant?.full_name || "Chat ",
        username: otherParticipant?.username || "",
        avatar: otherParticipant?.profile_picture || "/default-avatar.avif",
        isOnline: otherParticipant
          ? onlineUsers.includes(otherParticipant._id)
          : false,
      };
    } else {
      console.log("group details", conver);

      return {
        name: conver.group.name || "Group chat ",
        username: "Group",
        avatar: conver.group.imageGroup || "/default-avatar.avif",
        isOnline: false,
      };
    }
  };

  const handleShareNow = async () => {
    try {
      setSharing(true);
      const res = await sharePost(post._id, caption);
      if (res.success) {
        toast.success("Share post successfully!");
        if (onShare) onShare(res.post);
        onClose();
      } else {
        toast.error(res.message || "Share failed");
      }
    } catch (error) {
      console.error("Error when sharing:", error);
      toast.error("System error when sharing");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success("Copied post link!");
  };

  const handleSendMsg = async () => {
    if (!selectedConversation) return;
    setSendingMsg(true);
    const details = getConversationDetails(selectedConversation);
    try {
      const content = `${msgText.trim() ? msgText.trim() + "\n" : ""}${window.location.origin}/post/${post._id}`;
      const res = await sendMessageApi(selectedConversation._id, content);
      if (res.success) {
        toast.success(`Post sent to ${details.name}!`);
        setSelectedConversation(null);
        setMsgText("");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sharing post via message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMsg(false);
    }
  };

  const scrollMessenger = (direction) => {
    if (messengerScrollRef.current) {
      const scrollAmount = 200;
      messengerScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[92vh] border border-gray-100 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 shrink-0">
          <div className="w-8"></div>
          <h2 className="text-xl font-bold text-gray-900 select-none text-center flex-1">
            Share
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
                src={userCurrent?.profile_picture || "/default-avatar.avif"}
                alt=""
                className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200"
              />
              <div className="space-y-1">
                <span className="font-bold text-gray-900 block text-sm">
                  {userCurrent?.full_name || "Unknown"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold select-none">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md hover:bg-gray-200 cursor-pointer">
                    Feed
                  </span>
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md hover:bg-gray-200 cursor-pointer">
                    <Globe size={12} />
                    <span>Public</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption Input */}
            <div className="relative">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Say something about this... "
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
                    Loading...
                  </>
                ) : (
                  "Share now"
                )}
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section: Send via Messenger (Future feature) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center select-none">
              <h3 className="font-bold text-gray-900 text-sm">Messenger</h3>
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
              {loadingConversations ? (
                <div className="text-center w-full py-2 text-xs text-gray-500">
                  Loading conversation...
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center w-full py-2 text-xs text-gray-500">
                  No conversation found
                </div>
              ) : (
                conversations.map((conver) => {
                  const details = getConversationDetails(conver);
                  return (
                    <div
                      key={conver._id}
                      onClick={() => setSelectedConversation(conver)}
                      className="flex flex-col items-center text-center gap-1.5 shrink-0 w-16 group cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={details.avatar}
                          alt={details.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
                        />
                        {details.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-gray-700 truncate w-full group-hover:text-blue-600 transition-colors">
                        {details.name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section: Share to (Social Apps) */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-sm select-none">
              Share to
            </h3>

            <div className="grid grid-cols-6 gap-2 py-1 select-none">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full flex items-center justify-center shadow-sm transition-all group-hover:scale-105">
                  <LinkIcon size={22} />
                </div>
                <span className="text-[10px] text-gray-600 font-semibold group-hover:text-gray-900 text-center leading-tight">
                  Copy Link
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedConversation &&
        (() => {
          const details = getConversationDetails(selectedConversation);
          return (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4 animate-scale-in">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-bold text-gray-900 text-base">
                    Send to {details.name}
                  </h4>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg">
                  <img
                    src={details.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      {details.name}
                    </p>
                    {details.username && (
                      <p className="text-xs text-gray-500">
                        @{details.username}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600">
                    Additional message
                  </label>
                  <textarea
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Enter message..."
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[80px]"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMsg}
                    disabled={sendingMsg}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:bg-blue-400"
                  >
                    {sendingMsg ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default SharePostModal;
