import React, { useEffect, useRef, useState } from "react";
import { 
  ArrowLeft, ImageIcon, SendHorizonal, MoreVertical, ShieldAlert, Trash2, 
  BellOff, Info, Pin, UserPlus, Clock, Users, ChevronDown, ChevronRight,
  FileText, Link2, EyeOff, AlertTriangle, Edit2, Search, Sidebar,
  Smile, Paperclip, Contact, Scissors, Type, MessageSquare, CheckSquare, MoreHorizontal, ThumbsUp
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getConversationById } from "../services/Conversation";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { getMessages, sendMessage as sendMessageApi } from "../services/MessageServices";
import EmojiPicker from "emoji-picker-react";
import ConversationInfoSidebar from "../components/chat/ConversationInfoSidebar";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [error, setError] = useState("");
  const { userCurrent } = useAuth();
  const [user, setUser] = useState(null);
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();

  // Scroll pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Dropdown options menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Conversation Info Sidebar state - defaults to true for desktop as in mockup
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);
  
  // Accordion/Collapse states for sidebar sections
  const [collapseMedia, setCollapseMedia] = useState(false);
  const [collapseFiles, setCollapseFiles] = useState(false);
  const [collapseLinks, setCollapseLinks] = useState(false);
  const [collapseSecurity, setCollapseSecurity] = useState(false);

  // Security Toggles
  const [hideChatToggle, setHideChatToggle] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const { id } = useParams();

  const previousScrollHeightRef = useRef(0);

  const sendMessage = async (overrideText = null) => {
    const textToSend = overrideText !== null ? overrideText : text;
    if (!textToSend.trim() && images.length === 0) return;
    try {
      const data = await sendMessageApi(id, textToSend, images);
      if (data.success) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [data.message, ...prev];
        });
        if (overrideText === null) {
          setText("");
        }
        setImages([]);
        setShowEmojiPicker(false);
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn: ", err);
      setError(err.response?.data?.message || "Không thể gửi tin nhắn");
    }
  };

  const sendLike = () => {
    sendMessage("👍");
  };

  const fetchConversation = async () => {
    try {
      const data = await getConversationById(id);

      setUser(null);
      setConversation(null);

      if (data.success) {
        const conversation = data.conversation;
        setConversation(conversation);

        if (conversation.type === "direct") {
          const otherUser = conversation.participants.find(
            (p) => p.userId._id !== userCurrent._id,
          );
          setUser(otherUser.userId);
        } else {
          let us = {
            profile_picture: conversation.group.imageGroup,
            full_name: conversation.group.name,
            username: conversation.group.name,
          };
          setUser(us);
        }
      }
    } catch (error) {
      console.log("Lỗi: ", error);
      setError(error.response?.data?.message || "Lỗi tải hộp thoại");
    }
  };

  const fetchChatMessages = async (pageNum, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      }
      const data = await getMessages(id, pageNum, 20);
      if (data.success) {
        if (isLoadMore) {
          if (scrollContainerRef.current) {
            previousScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
          }
          setMessages((prev) => {
            const combined = [...prev];
            data.messages.forEach((msg) => {
              if (!combined.some((m) => m._id === msg._id)) {
                combined.push(msg);
              }
            });
            return combined;
          });
          setHasMore(data.currentPage < data.totalPages);
          setPage(data.currentPage);
        } else {
          setMessages(data.messages);
          setHasMore(data.currentPage < data.totalPages);
          setPage(1);
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }
          }, 100);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách tin nhắn: ", err);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      }
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current || loadingMore || !hasMore) return;

    if (scrollContainerRef.current.scrollTop <= 10) {
      fetchChatMessages(page + 1, true);
    }
  };

  useEffect(() => {
    if (previousScrollHeightRef.current && scrollContainerRef.current && loadingMore === false) {
      const currentHeight = scrollContainerRef.current.scrollHeight;
      const heightDifference = currentHeight - previousScrollHeightRef.current;
      if (heightDifference > 0) {
        scrollContainerRef.current.scrollTop = heightDifference;
      }
      previousScrollHeightRef.current = 0;
    }
  }, [messages, loadingMore]);

  useEffect(() => {
    if (!id) {
      setError("Chưa có Id hộp thoại");
      return;
    }
    fetchConversation();
    fetchChatMessages(1, false);
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    const handleNewMessage = (msg) => {
      if (msg.conversationId === id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [msg, ...prev];
        });

        if (scrollContainerRef.current) {
          const isNearBottom =
            scrollContainerRef.current.scrollHeight -
              scrollContainerRef.current.clientHeight -
              scrollContainerRef.current.scrollTop <
            200;
          if (isNearBottom) {
            setTimeout(() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
              }
            }, 100);
          }
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, id]);

  const isUserOnline = conversation?.type === "direct" && user && onlineUsers.includes(user._id);

  // Extract shared media (images) from current messages list
  const sharedMedia = messages
    .filter((msg) => msg.imageUrl && msg.imageUrl.length > 0)
    .reduce((acc, msg) => [...acc, ...msg.imageUrl], []);

  return (
    conversation && user && (
      <div className="flex h-screen bg-[#f4f5f7] relative overflow-hidden font-sans">
        {/* Main Chat Panel */}
        <div className="flex flex-col flex-1 h-full min-w-0 bg-[#f4f5f7] relative">
          {/* Header */}
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
                  src={user.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                  className="size-10 rounded-full object-cover border border-gray-150"
                  alt=""
                />
                {isUserOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-[15px] leading-tight">{user.full_name}</p>
                {conversation.type === "direct" ? (
                  <p className="text-xs text-gray-500">
                    {isUserOnline ? (
                      <span className="text-emerald-600 font-medium">Đang hoạt động</span>
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
                className={`p-2 rounded-full transition active:scale-95 cursor-pointer ${showInfoSidebar ? "bg-indigo-50 text-indigo-600" : "hover:bg-slate-100 text-slate-600"}`}
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
          </div>

          {/* Messages Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-4 md:px-8 overflow-y-auto bg-[#eef0f3]"
          >
            <div className="flex flex-col-reverse space-y-reverse space-y-3.5 max-w-4xl mx-auto pb-24">
              {messages.map((message, index) => {
                const isMe = (message.senderId?._id || message.senderId) === userCurrent._id;
                const sender = message.senderId;

                return (
                  <div
                    key={message._id || index}
                    className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <img
                        src={sender?.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                        className="size-8.5 rounded-full object-cover border border-gray-200 mt-1 flex-shrink-0"
                        alt=""
                      />
                    )}
                    <div className={`flex flex-col max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`p-2.5 px-3.5 text-sm rounded-lg shadow-sm border border-slate-100 ${
                          isMe
                            ? "bg-[#e6f2ff] text-slate-800"
                            : "bg-white text-slate-800"
                        }`}
                      >
                        {message.imageUrl && message.imageUrl.length > 0 && (
                          <div className="mb-2 grid gap-1">
                            {message.imageUrl.map((url, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={url}
                                className="max-h-60 w-full object-cover rounded"
                                alt=""
                              />
                            ))}
                          </div>
                        )}
                        {message.content && <p className="break-words break-all whitespace-pre-wrap leading-relaxed">{message.content}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 px-1">
                        <span className="text-[10px] text-gray-400">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && (
                          <span className="text-[10px] text-gray-400">✓ Đã nhận</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {loadingMore && (
                <div className="flex justify-center py-2">
                  <div className="size-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-transparent p-3 pt-1 z-10">
            {showEmojiPicker && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 shadow-2xl rounded-xl overflow-hidden">
                <EmojiPicker onEmojiClick={(emojiData) => setText((prev) => prev + emojiData.emoji)} />
              </div>
            )}

            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2 max-w-xl mx-auto bg-white p-2 rounded-lg shadow border border-gray-100">
                {images.map((img, i) => (
                  <div key={i} className="relative size-14 bg-slate-50 rounded border border-gray-250">
                    <img src={URL.createObjectURL(img)} className="size-full object-cover rounded" alt="" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full size-4.5 flex items-center justify-center text-[10px] font-bold shadow cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5 relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className={`p-1 hover:bg-slate-100 rounded-full transition cursor-pointer ${showEmojiPicker ? "text-indigo-600 bg-indigo-50" : "text-slate-400"}`}
              >
                <Smile className="size-6" />
              </button>

              <textarea
                className="flex-1 outline-none text-slate-700 bg-transparent resize-none py-1 max-h-24 min-h-[28px] text-sm align-middle leading-normal"
                placeholder="Type a message ... "
                rows={1}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                    e.target.style.height = "auto";
                  }
                }}
              />

              <label htmlFor="image" className="cursor-pointer p-1 hover:bg-slate-100 rounded-full transition flex items-center justify-center">
                <ImageIcon className="size-6.5 text-gray-400" />
                <input
                  type="file"
                  hidden
                  multiple
                  id="image"
                  accept="image/*"
                  onChange={(e) => setImages((prev) => [...prev, ...Array.from(e.target.files)])}
                />
              </label>
              <button
                onClick={() => sendMessage()}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full"
              >
                <SendHorizonal size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Conversation Info (Right panel) */}
        <ConversationInfoSidebar
          user={user}
          conversation={conversation}
          isUserOnline={isUserOnline}
          sharedMedia={sharedMedia}
          showInfoSidebar={showInfoSidebar}
          setShowInfoSidebar={setShowInfoSidebar}
          collapseMedia={collapseMedia}
          setCollapseMedia={setCollapseMedia}
          collapseFiles={collapseFiles}
          setCollapseFiles={setCollapseFiles}
          collapseLinks={collapseLinks}
          setCollapseLinks={setCollapseLinks}
          collapseSecurity={collapseSecurity}
          setCollapseSecurity={setCollapseSecurity}
          hideChatToggle={hideChatToggle}
          setHideChatToggle={setHideChatToggle}
          messages={messages}
        />
      </div>
    )
  );
};

export default ChatBox;
