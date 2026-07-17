import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { useChat } from "../../contexts/ChatContext";
import { getLinkPreview as getLinkPreviewApi } from "../../services/MessageServices";

import ConversationInfoSidebar from "../../components/chat/ConversationInfoSidebar";
import MediaModal from "../../components/chat/MediaModal";
import { X, ShieldAlert } from "lucide-react";

// Extracted sub-components
import ChatHeader from "../../components/chat/ChatHeader";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";

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
  const [selectedReactionsMessage, setSelectedReactionsMessage] =
    useState(null);
  const [activeDropdownMsgId, setActiveDropdownMsgId] = useState(null);
  const [messageToRecall, setMessageToRecall] = useState(null);
  const lastFetchedUrlRef = useRef("");
  const lastMessageIdRef = useRef(null);
  const scrollPositionBeforeLoadRef = useRef(null);
  const { userCurrent } = useAuth();
  const [user, setUser] = useState(null);
  const { onlineUsers } = useSocket();

  const {
    messages,
    currentConversation,
    setCurrentConversation,
    selectConversationById,
    fetchChatMessages,
    sendMessage,
    handleReact,
    handleRecallMessage,
    handleDeleteMessageForMe,
    messagesLoading,
    messagesHasMore,
    messagesPage,
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

  const longPressTimerRef = useRef(null);
  const touchStartPosRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (messageId) => (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      setActiveDropdownMsgId(messageId);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 600);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const diffX = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const diffY = Math.abs(touch.clientY - touchStartPosRef.current.y);
    if (diffX > 10 || diffY > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenu = (messageId) => (e) => {
    e.preventDefault();
    setActiveDropdownMsgId(messageId);
  };

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
    if (!scrollContainerRef.current || messagesLoading || !messagesHasMore)
      return;

    if (scrollContainerRef.current.scrollTop <= 10) {
      // Lưu lại chiều cao của container trước khi tải dữ liệu trang mới
      scrollPositionBeforeLoadRef.current =
        scrollContainerRef.current.scrollHeight;
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

  // useEffect tự động cuộn trang khi nhận tin nhắn mới và giữ vị trí cuộn khi phân trang
  useEffect(() => {
    if (messages.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      // Nếu đang trong quá trình tải tin nhắn cũ (phân trang)
      if (scrollPositionBeforeLoadRef.current !== null) {
        const heightDifference =
          container.scrollHeight - scrollPositionBeforeLoadRef.current;
        container.scrollTop = heightDifference;
        scrollPositionBeforeLoadRef.current = null;
        return;
      }

      const latestMsg = messages[0]; // tin nhắn mới nhất
      const latestMsgId = latestMsg._id || latestMsg.createdAt;

      // Chỉ tự động cuộn xuống đáy khi có tin nhắn mới thực sự
      if (latestMsgId !== lastMessageIdRef.current) {
        lastMessageIdRef.current = latestMsgId;

        const isMe =
          (latestMsg.senderId?._id || latestMsg.senderId) === userCurrent._id;

        const isNearBottom =
          container.scrollHeight -
            container.clientHeight -
            container.scrollTop <
          300;

        if (isMe || isNearBottom) {
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop =
                scrollContainerRef.current.scrollHeight;
            }
          }, 50);
        }
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
          <ChatHeader
            user={user}
            currentConversation={currentConversation}
            isUserOnline={isUserOnline}
            navigate={navigate}
            setShowInfoSidebar={setShowInfoSidebar}
            showInfoSidebar={showInfoSidebar}
            showMoreMenu={showMoreMenu}
            setShowMoreMenu={setShowMoreMenu}
            error={error}
          />

          <MessageList
            scrollContainerRef={scrollContainerRef}
            handleScroll={handleScroll}
            currentConversation={currentConversation}
            messages={messages}
            userCurrent={userCurrent}
            handleContextMenu={handleContextMenu}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            openImageModal={openImageModal}
            setSelectedReactionsMessage={setSelectedReactionsMessage}
            handleReact={handleReact}
            activeReactPickerMsgId={activeReactPickerMsgId}
            setActiveReactPickerMsgId={setActiveReactPickerMsgId}
            activeDropdownMsgId={activeDropdownMsgId}
            setActiveDropdownMsgId={setActiveDropdownMsgId}
            setMessageToRecall={setMessageToRecall}
            setReplyingTo={setReplyingTo}
            handleDeleteMessageForMe={handleDeleteMessageForMe}
          />

          {currentConversation.isDisband === true ? (
            <div className="p-4 bg-rose-50 border-t border-rose-100 text-rose-700 text-xs font-semibold text-center select-none flex items-center justify-center gap-1.5 dark:bg-rose-950/20 dark:border-rose-900/30 shrink-0">
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>This group has been disbanded by the administrator.</span>
            </div>
          ) : currentConversation.isDelete === true ? (
            <div className="p-4 bg-rose-50 border-t border-rose-100 text-rose-700 text-xs font-semibold text-center select-none flex items-center justify-center gap-1.5 dark:bg-rose-950/20 dark:border-rose-900/30 shrink-0">
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>This conversation has been deleted by the owner.</span>
            </div>
          ) : currentConversation.isActive === false ? (
            <div className="p-4 bg-amber-50 border-t border-amber-100 text-amber-700 text-xs font-semibold text-center select-none flex items-center justify-center gap-1.5 dark:bg-amber-950/20 dark:border-amber-900/30 shrink-0">
              <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>This conversation has been suspended due to Community Standards violations.</span>
            </div>
          ) : (
            <MessageInput
              text={text}
              setText={setText}
              images={images}
              setImages={setImages}
              filesToSend={filesToSend}
              setFilesToSend={setFilesToSend}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              linkPreview={linkPreview}
              setLinkPreview={setLinkPreview}
              showLinkPreview={showLinkPreview}
              setShowLinkPreview={setShowLinkPreview}
              isLoadingPreview={isLoadingPreview}
              isSending={isSending}
              handleSendMessage={handleSendMessage}
              currentConversation={currentConversation}
              userCurrent={userCurrent}
            />
          )}
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

        {/* Reactions Detail Modal */}
        {selectedReactionsMessage && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 w-[90%] max-w-sm rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] border border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-zinc-800">
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Biểu cảm tin nhắn
                </span>
                <button
                  onClick={() => setSelectedReactionsMessage(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {selectedReactionsMessage.reactions.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-zinc-800/50 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          r.userId?.profile_picture || "/default-avatar.avif"
                        }
                        className="size-9 rounded-full object-cover border border-slate-100 dark:border-zinc-800"
                        alt=""
                      />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {r.userId?.full_name || "Thành viên"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          @{r.userId?.username || "username"}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl">{r.emoji}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recall Message Confirmation Modal */}
        {messageToRecall && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-120 animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 w-[90%] max-w-sm rounded-xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-center">
                Thu hồi tin nhắn?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-normal">
                Tin nhắn này sẽ bị thu hồi với tất cả thành viên trong cuộc trò
                chuyện. Bạn không thể hoàn tác hành động này.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setMessageToRecall(null)}
                  className="px-4 py-1.5 rounded-lg border dark:border-zinc-800 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-55 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRecallMessage(messageToRecall._id);
                    setMessageToRecall(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                >
                  Thu hồi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default ChatBox;
