import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ImageIcon,
  SendHorizonal,
  MoreVertical,
  ShieldAlert,
  Trash2,
  BellOff,
  Info,
  UserPlus,
  FileText,
  Search,
  Sidebar,
  Smile,
  Paperclip,
  Reply,
  X,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { useChat } from "../contexts/ChatContext";
import { getLinkPreview as getLinkPreviewApi } from "../services/MessageServices";

import EmojiPicker from "emoji-picker-react";
import ConversationInfoSidebar from "../components/chat/ConversationInfoSidebar";
import MediaModal from "../components/chat/MediaModal";
import toast from "react-hot-toast";

const renderMessageContent = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part) || part.match(/^https?:\/\//i)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline break-all font-medium"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const ChatBox = () => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [filesToSend, setFilesToSend] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [linkPreview, setLinkPreview] = useState(null);
  const [showLinkPreview, setShowLinkPreview] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [activeReactPickerMsgId, setActiveReactPickerMsgId] = useState(null);
  const lastFetchedUrlRef = useRef("");
  const { userCurrent } = useAuth();
  const [user, setUser] = useState(null);
  const {  onlineUsers } = useSocket();

  const {
    messages,
    currentConversation,
    setCurrentConversation,
    selectConversationById,
    fetchChatMessages,
    sendMessage,
    handleReact,
    messagesLoading,
    messagesHasMore,
    messagesPage
  } = useChat();

  const navigate = useNavigate();

  // Image Modal states
  const [modalMedia, setModalMedia] = useState(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const openImageModal = (mediaList, index) => {
    setModalMedia(mediaList);
    setModalIndex(index);
    setShowModal(true);
  };

  // Dropdown options menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [showInfoSidebar, setShowInfoSidebar] = useState(true);

  // Accordion/Collapse states for sidebar sections
  const [collapseMedia, setCollapseMedia] = useState(false);
  const [collapseFiles, setCollapseFiles] = useState(false);
  const [collapseLinks, setCollapseLinks] = useState(false);
  const [collapseSecurity, setCollapseSecurity] = useState(false);

  // Security Toggles
  const [hideChatToggle, setHideChatToggle] = useState(false);

  const scrollContainerRef = useRef(null);
  const { id } = useParams();

  const previousScrollHeightRef = useRef(0);

  const handleSendMessage = async (overrideText = null) => {
    const textToSend = overrideText !== null ? overrideText : text;
    if (!textToSend.trim() && images.length === 0 && filesToSend.length === 0)
      return;
    if (isSending) return;
    setIsSending(true);
    try {
      const data = await sendMessage(
        id,
        textToSend,
        images,
        filesToSend,
        replyingTo?._id,
        showLinkPreview ? linkPreview : null,
      );
      if (data.success) {
        if (overrideText === null) {
          setText("");
        }
        setImages([]);
        setFilesToSend([]);
        setReplyingTo(null);
        setLinkPreview(null);
        setShowLinkPreview(false);
        lastFetchedUrlRef.current = "";
        setShowEmojiPicker(false);
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop =
              scrollContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn: ", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current || messagesLoading || !messagesHasMore) return;

    if (scrollContainerRef.current.scrollTop <= 10) {
      fetchChatMessages(id, messagesPage + 1, true);
    }
  };

  useEffect(() => {
    if (
      previousScrollHeightRef.current &&
      scrollContainerRef.current &&
      messagesLoading === false
    ) {
      const currentHeight = scrollContainerRef.current.scrollHeight;
      const heightDifference = currentHeight - previousScrollHeightRef.current;
      if (heightDifference > 0) {
        scrollContainerRef.current.scrollTop = heightDifference;
      }
      previousScrollHeightRef.current = 0;
    }
  }, [messages, messagesLoading]);

  useEffect(() => {
    if (!id) {
      setError("Chưa có Id hộp thoại");
      return;
    }
    selectConversationById(id);
    fetchChatMessages(id, 1, false);
  }, [id]);

  // Xóa hàm fetchConversation cũ, thay bằng useEffect này:
  useEffect(() => {
    if (!currentConversation) {
      setUser(null);
      return;
    }
    if (currentConversation.type === "direct") {
      const otherUser = currentConversation.participants.find(
        (p) => p.userId._id !== userCurrent._id,
      );
      setUser(otherUser?.userId || null);
    } else {
      let us = {
        profile_picture: currentConversation.group?.imageGroup,
        full_name: currentConversation.group?.name,
        username: currentConversation.group?.name,
      };
      setUser(us);
    }
  }, [currentConversation, userCurrent]);

  // useEffect tự động cuộn trang khi nhận tin nhắn mới
  useEffect(() => {
    if (messages.length > 0 && scrollContainerRef.current) {
      const latestMsg = messages[0]; // tin nhắn mới nhất nằm ở đầu mảng (do flex-col-reverse)
      const isMe = (latestMsg.senderId?._id || latestMsg.senderId) === userCurrent._id;
      
      const isNearBottom =
        scrollContainerRef.current.scrollHeight -
          scrollContainerRef.current.clientHeight -
          scrollContainerRef.current.scrollTop <
        300;

      if (isMe || isNearBottom) {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        }, 50);
      }
    }
  }, [messages, userCurrent]);

  // useEffect để phát hiện URL trong ô input và tự động tải link preview (Metadata)
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const match = text.match(urlRegex);
    if (match && match[0]) {
      const url = match[0];
      if (url !== lastFetchedUrlRef.current) {
        lastFetchedUrlRef.current = url;
        const fetchPreview = async () => {
          setIsLoadingPreview(true);
          try {
            const data = await getLinkPreviewApi(url);
            if (data.success && data.preview) {
              setLinkPreview(data.preview);
              setShowLinkPreview(true);
            }
          } catch (e) {
            console.error("Lỗi fetch preview:", e);
          } finally {
            setIsLoadingPreview(false);
          }
        };
        fetchPreview();
      }
    } else {
      if (!text.trim()) {
        setLinkPreview(null);
        setShowLinkPreview(false);
        lastFetchedUrlRef.current = "";
      }
    }
  }, [text]);

  const isUserOnline =
    currentConversation?.type === "direct" &&
    user &&
    onlineUsers.includes(user._id);

  // Extract shared media (images) from current messages list
  const sharedMedia = messages
    .filter((msg) => msg.imageUrl && msg.imageUrl.length > 0)
    .reduce((acc, msg) => [...acc, ...msg.imageUrl], []);

  return (
    currentConversation &&
    user && (
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
                  src={
                    user.profile_picture ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                  }
                  className="size-10 rounded-full object-cover border border-gray-150"
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
            {error && <p className="bg-red-700">{error}</p>}
          </div>

          {/* Messages Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-4 md:px-8 overflow-y-auto transition-all duration-300"
            style={{
              backgroundColor: currentConversation?.theme?.type === "image" ? undefined : (currentConversation?.theme?.value || "#eef0f3"),
              backgroundImage: currentConversation?.theme?.type === "image" ? `url(${currentConversation.theme.value})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex flex-col-reverse space-y-reverse space-y-3.5 max-w-4xl mx-auto pb-24">
              {messages.map((message, index) => {
                const isMe =
                  (message.senderId?._id || message.senderId) ===
                  userCurrent._id;
                const sender = message.senderId;

                return (
                  <div
                    key={message._id || index}
                    className={`flex gap-3 group ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <img
                        src={
                          sender?.profile_picture ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                        }
                        className="size-8.5 rounded-full object-cover border border-gray-200 mt-1 flex-shrink-0"
                        alt=""
                      />
                    )}
                    <div
                      className={`flex flex-col max-w-[65%] ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`p-2.5 px-3.5 text-sm rounded-lg shadow-sm border border-slate-100 relative ${
                          isMe
                            ? "bg-[#e6f2ff] text-slate-800"
                            : "bg-white text-slate-800"
                        }`}
                      >
                        {message.replyTo && (
                          <div className="mb-2 p-2 rounded bg-black/5 border-l-2 border-slate-400 text-[11px] text-slate-600">
                            <p className="font-bold text-[9px]">
                              {message.replyTo.senderId?._id === userCurrent._id
                                ? "Bạn"
                                : message.replyTo.senderId?.full_name ||
                                  "Thành viên"}
                            </p>
                            <p className="truncate max-w-[200px]">
                              {message.replyTo.content ||
                                (message.replyTo.imageUrl?.length > 0
                                  ? "[Hình ảnh]"
                                  : message.replyTo.files?.length > 0
                                    ? "[Tệp tin]"
                                    : "")}
                            </p>
                          </div>
                        )}
                        {message.imageUrl && message.imageUrl.length > 0 && (
                          <div className="mb-2">
                            {(() => {
                              const imgs = message.imageUrl;
                              const count = imgs.length;
                              if (count === 1) {
                                return (
                                  <div
                                    className="cursor-pointer overflow-hidden rounded-lg max-h-80 max-w-sm"
                                    onClick={() => openImageModal(imgs, 0)}
                                  >
                                    <img
                                      src={imgs[0]}
                                      className="w-full h-full object-cover hover:opacity-95 transition"
                                      alt=""
                                    />
                                  </div>
                                );
                              }
                              if (count === 2) {
                                return (
                                  <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-w-sm">
                                    {imgs.map((url, idx) => (
                                      <div
                                        key={idx}
                                        className="cursor-pointer h-32"
                                        onClick={() =>
                                          openImageModal(imgs, idx)
                                        }
                                      >
                                        <img
                                          src={url}
                                          className="w-full h-full object-cover hover:opacity-95 transition"
                                          alt=""
                                        />
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              if (count === 3) {
                                return (
                                  <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden max-w-sm">
                                    {imgs.map((url, idx) => (
                                      <div
                                        key={idx}
                                        className="cursor-pointer h-24"
                                        onClick={() =>
                                          openImageModal(imgs, idx)
                                        }
                                      >
                                        <img
                                          src={url}
                                          className="w-full h-full object-cover hover:opacity-95 transition"
                                          alt=""
                                        />
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              const remaining = count - 4;
                              return (
                                <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-w-sm">
                                  {imgs.slice(0, 4).map((url, idx) => {
                                    const isLast = idx === 3;
                                    return (
                                      <div
                                        key={idx}
                                        className="cursor-pointer relative h-28"
                                        onClick={() =>
                                          openImageModal(imgs, idx)
                                        }
                                      >
                                        <img
                                          src={url}
                                          className="w-full h-full object-cover hover:opacity-95 transition"
                                          alt=""
                                        />
                                        {isLast && remaining > 0 && (
                                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm select-none">
                                            +{remaining}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                        {message.content && (
                          <p className="break-words break-all whitespace-pre-wrap leading-relaxed">
                            {renderMessageContent(message.content)}
                          </p>
                        )}
                        {message.linkPreview && (
                          <a
                            href={message.linkPreview.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex flex-col sm:flex-row gap-3 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg overflow-hidden transition text-left no-underline select-none max-w-sm"
                          >
                            {message.linkPreview.image && (
                              <img
                                src={message.linkPreview.image}
                                alt=""
                                className="w-full sm:w-20 h-28 sm:h-20 object-cover rounded border border-gray-150 flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="font-semibold text-slate-800 text-[12px] line-clamp-2 leading-snug">
                                {message.linkPreview.title}
                              </p>
                              {message.linkPreview.description && (
                                <p className="text-[10px] text-gray-500 line-clamp-1 mt-1">
                                  {message.linkPreview.description}
                                </p>
                              )}
                              <p className="text-[9px] text-indigo-600 font-semibold mt-1 uppercase tracking-wide">
                                {message.linkPreview.domain || "Link"}
                              </p>
                            </div>
                          </a>
                        )}
                        {message.files && message.files.length > 0 && (
                          <div className="mt-2 space-y-1.5 min-w-[200px]">
                            {message.files.map((file, fileIdx) => {
                              const isVideo = file.name.match(
                                /\.(mp4|webm|ogg|mov)$/i,
                              );
                              if (isVideo) {
                                return (
                                  <div
                                    key={fileIdx}
                                    className="overflow-hidden rounded-lg max-w-sm mt-1 border border-gray-200 shadow-sm bg-black"
                                  >
                                    <video
                                      src={file.url}
                                      controls
                                      className="w-full max-h-64 object-contain"
                                    />
                                  </div>
                                );
                              }
                              return (
                                <a
                                  key={fileIdx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`flex items-center gap-3 p-2 rounded border hover:bg-slate-50 transition cursor-pointer ${
                                    isMe
                                      ? "bg-white text-slate-800 border-blue-200"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                >
                                  <div className="size-8.5 bg-emerald-50 rounded flex items-center justify-center text-emerald-600 flex-shrink-0">
                                    <FileText className="size-4.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate text-slate-800">
                                      {file.name}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                      {file.size || "Unknown size"}
                                    </p>
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        )}

                        {message.reactions && message.reactions.length > 0 && (
                          <div
                            className={`absolute bottom-[-24px] ${isMe ? "left-1" : "right-2"} flex items-center gap-0.5 bg-white border border-gray-150 px-3 py-0.5 rounded-full shadow-sm text-[10px] z-10 select-none`}
                          >
                            {message.reactions.map((r, i) => (
                              <div
                                key={i}
                                title={r.userId?.full_name || "Thành viên"}
                                className="text-lg flex justify-center items-center"
                              >
                                <div className=""> {r.emoji}</div>
                              </div>
                            ))}
                            {message.reactions.length > 1 && (
                              <span className="text-[19px] text-slate-500 font-semibold pl-0.5">
                                {message.reactions.length}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 px-1">
                        <span className="text-[10px] text-gray-400">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && (
                          <span className="text-[10px] text-gray-400">
                            ✓ Đã nhận
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hover Action Bar */}
                    <div
                      className={`opacity-0 group-hover:opacity-100 transition duration-150 flex items-center gap-1 self-center ${isMe ? "order-first" : ""}`}
                    >
                      <div className="relative group/react">
                        <button className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer">
                          <Smile size={15} />
                        </button>
                        <div className="hidden group-hover/react:flex absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-gray-50 shadow-lg rounded-full p-1 gap-1.5 z-30 items-center">
                          {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReact(message._id, emoji)}
                              className="hover:scale-125 transition duration-100 p-0.5 cursor-pointer text-[19px] "
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            onClick={() => setActiveReactPickerMsgId(message._id)}
                            className="hover:scale-125 transition duration-100 p-1 size-7 cursor-pointer text-[15px] font-bold text-slate-400 hover:text-indigo-600 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full"
                          >
                            +
                          </button>
                          {activeReactPickerMsgId === message._id && (
                            <>
                              <div
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveReactPickerMsgId(null);
                                }}
                              ></div>
                              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 shadow-2xl rounded-xl overflow-hidden">
                                <EmojiPicker
                                  onEmojiClick={(emojiData) => {
                                    handleReact(message._id, emojiData.emoji);
                                    setActiveReactPickerMsgId(null);
                                  }}
                                  previewConfig={{ showPreview: false }}
                                  skinTonesDisabled
                                  height={300}
                                  width={250}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setReplyingTo(message)}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        <Reply size={15} className="-scale-x-100" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {messagesLoading && (
                <div className="flex justify-center py-2">
                  <div className="size-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-transparent p-3 pt-1 z-10">
            {replyingTo && (
              <div className="flex items-center justify-between max-w-xl mx-auto bg-white/95 backdrop-blur border border-gray-200 p-2 px-4 rounded-t-xl text-xs text-slate-600 shadow-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[9px] text-indigo-600">
                    Đang trả lời{" "}
                    {replyingTo.senderId?._id === userCurrent._id
                      ? "chính mình"
                      : replyingTo.senderId?.full_name || "Thành viên"}
                  </p>
                  <p className="truncate max-w-[400px] text-slate-500">
                    {replyingTo.content ||
                      (replyingTo.imageUrl?.length > 0
                        ? "[Hình ảnh]"
                        : replyingTo.files?.length > 0
                          ? "[Tệp tin]"
                          : "")}
                  </p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ×
                </button>
              </div>
            )}

            {isLoadingPreview && (
              <div className="flex items-center gap-3 max-w-xl mx-auto bg-white/95 backdrop-blur border border-gray-200 p-2.5 px-4 rounded-t-xl text-xs text-slate-600 shadow-lg relative">
                <div className="size-16 bg-slate-100 rounded-md animate-pulse flex-shrink-0"></div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            )}

            {showLinkPreview && linkPreview && (
              <div className="flex items-center gap-3 max-w-xl mx-auto bg-white/95 backdrop-blur border border-gray-200 p-2.5 px-4 rounded-t-xl text-xs text-slate-600 shadow-lg relative group">
                {linkPreview.image && (
                  <img
                    src={linkPreview.image}
                    alt=""
                    className="size-16 object-cover rounded-md border border-gray-150 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 pr-6">
                  <p className="font-semibold text-slate-800 text-[13px] truncate">
                    {linkPreview.title}
                  </p>
                  {linkPreview.description && (
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {linkPreview.description}
                    </p>
                  )}
                  <p className="text-[10px] text-indigo-600 font-medium mt-1">
                    {linkPreview.domain || linkPreview.siteName || "Link preview"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkPreview(false);
                    setLinkPreview(null);
                  }}
                  className="absolute top-2.5 right-2.5 p-1 hover:bg-slate-100 rounded-full transition cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {showEmojiPicker && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 shadow-2xl rounded-xl overflow-hidden">
                <EmojiPicker
                  onEmojiClick={(emojiData) =>
                    setText((prev) => prev + emojiData.emoji)
                  }
                />
              </div>
            )}

            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2 max-w-xl mx-auto bg-white p-2 rounded-lg shadow border border-gray-100">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative size-14 bg-slate-50 rounded border border-gray-250"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      className="size-full object-cover rounded"
                      alt=""
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full size-4.5 flex items-center justify-center text-[10px] font-bold shadow cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {filesToSend.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2 max-w-xl mx-auto bg-white p-2 rounded-lg shadow border border-gray-100">
                {filesToSend.map((f, i) => (
                  <div
                    key={i}
                    className="relative flex items-center gap-2 p-1.5 bg-slate-50 border border-gray-200 rounded"
                  >
                    <FileText className="size-5 text-emerald-600" />
                    <span className="text-xs truncate max-w-[120px]">
                      {f.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFilesToSend((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full size-4 flex items-center justify-center text-[10px] font-bold shadow cursor-pointer ml-1"
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
                    handleSendMessage();
                    e.target.style.height = "auto";
                  }
                }}
              />

              <label
                htmlFor="image"
                className="cursor-pointer p-1 hover:bg-slate-100 rounded-full transition flex items-center justify-center"
              >
                <ImageIcon className="size-6.5 text-gray-400" />
                <input
                  type="file"
                  hidden
                  multiple
                  id="image"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files);
                    const oversized = selectedFiles.filter(
                      (f) => f.size > 10 * 1024 * 1024,
                    );
                    if (oversized.length > 0) {
                      toast.error("Tệp ảnh không được vượt quá 10MB!");
                    }
                    const allowed = selectedFiles.filter(
                      (f) => f.size <= 10 * 1024 * 1024,
                    );
                    setImages((prev) => [...prev, ...allowed]);
                  }}
                />
              </label>

              <label
                htmlFor="file-input"
                className="cursor-pointer p-1 hover:bg-slate-100 rounded-full transition flex items-center justify-center mr-1"
              >
                <Paperclip className="size-6 text-gray-400" />
                <input
                  type="file"
                  hidden
                  multiple
                  id="file-input"
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files);
                    const oversized = selectedFiles.filter(
                      (f) => f.size > 10 * 1024 * 1024,
                    );
                    if (oversized.length > 0) {
                      toast.error("Tệp tin đính kèm không được vượt quá 10MB!");
                    }
                    const allowed = selectedFiles.filter(
                      (f) => f.size <= 10 * 1024 * 1024,
                    );
                    allowed.forEach((file) => {
                      const isImage =
                        file.type.startsWith("image/") ||
                        file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                      if (isImage) {
                        setImages((prev) => [...prev, file]);
                      } else {
                        setFilesToSend((prev) => [...prev, file]);
                      }
                    });
                  }}
                />
              </label>

              {text.trim() || images.length > 0 || filesToSend.length > 0 ? (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isSending}
                  className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[34px] min-h-[34px]"
                >
                  {isSending ? (
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <SendHorizonal size={18} />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage(currentConversation?.quickEmoji || "👍")}
                  className="text-2xl hover:scale-115 active:scale-95 transition cursor-pointer select-none"
                >
                  {currentConversation?.quickEmoji || "👍"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Conversation Info (Right panel) */}
        <ConversationInfoSidebar
          user={user}
          conversation={currentConversation}
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
          onConversationUpdate={setCurrentConversation}
        />

        <MediaModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mediaList={modalMedia}
          initialIndex={modalIndex}
        />
      </div>
    )
  );
};

export default ChatBox;
