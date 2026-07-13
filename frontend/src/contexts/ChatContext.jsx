import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import {
  getConversations,
  getConversationById,
  updateConversationCustomization,
  markConversationAsRead,
} from "../services/ConversationServices";

import {
  getMessages,
  sendMessage as sendMessageApi,
  reactToMessage,
  recallMessage,
  deleteMessageForMe,
} from "../services/MessageServices";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { socket } = useSocket();
  const { userCurrent } = useAuth();

  // Conversation
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Messages
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesHasMore, setMessagesHasMore] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchConversations = async (pageNumber = 1, append = false) => {
    try {
      if (pageNumber === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError("");
      const limit = 5;
      const result = await getConversations();

      if (result.success) {
        if (append) {
          setConversations((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));

            const newConversations = (result.conversations || []).filter(
              (p) => !existingIds.has(p._id),
            );

            return [...prev, ...newConversations];
          });
        } else {
          setConversations(result.conversations || []);
        }

        if (result.pagination) {
          setPage(result.pagination.currentPage);
          setHasMore(result.pagination.hasMore);
        }
      } else {
        if (!append) setConversations([]);
        setHasMore(false);
      }
    } catch (error) {
      console.log("LỖI: ", error);
      setError(error.response?.data?.message || "Error: " + error);
      if (!append) setConversations([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const selectConversationById = async (id) => {
    if (!id) return null;

    // Đánh dấu đã đọc trên backend
    markConversationAsRead(id).catch((err) => console.error("Lỗi đánh dấu đã đọc:", err));

    // Bước 1: Tìm trong state local
    const localConv = conversations.find((c) => c._id === id);
    if (localConv) {
      setCurrentConversation(localConv);
      return localConv;
    }
    // Bước 2: Gọi API nếu không tìm thấy ở local (hỗ trợ deep link / lazy load)
    try {
      setIsLoading(true);
      const result = await getConversationById(id);
      if (result.success && result.conversation) {
        const newConv = result.conversation;
        setCurrentConversation(newConv);

        // Thêm cuộc hội thoại mới này vào danh sách local để tránh fetch lại
        setConversations((prev) => {
          if (prev.some((c) => c._id === newConv._id)) return prev;
          return [newConv, ...prev];
        });
        return newConv;
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông tin cuộc hội thoại:", err);
      setError("Không thể tải cuộc hội thoại");
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  const fetchChatMessages = async (
    conversationId,
    pageNum = 1,
    isLoadMore = false,
  ) => {
    try {
      if (isLoadMore) {
        setMessagesLoading(true);
      }
      const data = await getMessages(conversationId, pageNum, 20);
      if (data.success) {
        if (isLoadMore) {
          setMessages((prev) => {
            const combined = [...prev];
            data.messages.forEach((msg) => {
              if (!combined.some((m) => m._id === msg._id)) {
                combined.push(msg);
              }
            });
            return combined;
          });
          setMessagesHasMore(data.currentPage < data.totalPages);
          setMessagesPage(data.currentPage);
        } else {
          setMessages(data.messages);
          setMessagesHasMore(data.currentPage < data.totalPages);
          setMessagesPage(1);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách tin nhắn: ", err);
    } finally {
      if (isLoadMore) {
        setMessagesLoading(false);
      }
    }
  };

  const sendMessage = async (
    conversationId,
    text,
    images = [],
    filesToSend = [],
    replyingToId = null,
    linkPreview = null,
  ) => {
    try {
      const data = await sendMessageApi(
        conversationId,
        text,
        images,
        filesToSend,
        replyingToId,
        linkPreview,
      );
      if (data.success) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [data.message, ...prev];
        });
        return { success: true, message: data.message };
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
      setError(err.response?.data?.message || "Không thể gửi tin nhắn");
      throw err;
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {
      const data = await reactToMessage(messageId, emoji);
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, reactions: data.reactions } : msg,
          ),
        );
      }
    } catch (err) {
      console.error("Lỗi bày tỏ biểu cảm: ", err);
    }
  };

  const handleRecallMessage = async (messageId) => {
    try {
      const data = await recallMessage(messageId);
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  content: "Tin nhắn đã bị thu hồi",
                  imageUrl: [],
                  files: [],
                  reactions: [],
                  linkPreview: null,
                  isRecall: true,
                }
              : msg
          )
        );
        // Also update conversations last message if needed
        setConversations((prev) =>
          prev.map((c) => {
            if (c.lastMessage && c.lastMessage._id === messageId) {
              return {
                ...c,
                lastMessage: {
                  ...c.lastMessage,
                  content: "Tin nhắn đã bị thu hồi",
                },
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error("Lỗi thu hồi tin nhắn: ", err);
      throw err;
    }
  };

  const handleDeleteMessageForMe = async (messageId) => {
    try {
      const data = await deleteMessageForMe(messageId);
      if (data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        toast.success("Đã xóa tin nhắn phía bạn");
      }
    } catch (err) {
      console.error("Lỗi xóa tin nhắn: ", err);
      toast.error(err.response?.data?.message || "Không thể xóa tin nhắn");
    }
  };

  const updateCustomization = async (conversationId, themeType, themeValue, quickEmoji) => {
    try {
      const data = await updateConversationCustomization(conversationId, {
        themeType,
        themeValue,
        quickEmoji
      });
      if (data.success && data.conversation) {
        const updated = data.conversation;
        if (currentConversation && currentConversation._id === conversationId) {
          setCurrentConversation(updated);
        }
        setConversations((prev) =>
          prev.map((c) => (c._id === conversationId ? updated : c))
        );
        return { success: true, conversation: updated };
      }
    } catch (err) {
      console.error("Lỗi cập nhật tùy chỉnh:", err);
      setError("Không thể cập nhật tùy chỉnh");
      throw err;
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // 1. Nếu tin nhắn thuộc cuộc hội thoại đang được mở -> Thêm vào list tin nhắn hiển thị
      if (currentConversation && msg.conversationId === currentConversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [msg, ...prev];
        });

        // Gọi API đánh dấu đã đọc ngay lập tức vì người dùng đang mở hộp thoại này
        markConversationAsRead(currentConversation._id).catch((err) =>
          console.error("Lỗi đánh dấu đã đọc:", err)
        );
      }
    };

    const handleConversationUpdated = (updatedConv) => {
      // Cập nhật danh sách hộp thoại bên trái và đưa lên đầu
      setConversations((prev) => {
        const filtered = prev.filter((c) => c._id !== updatedConv._id);
        return [updatedConv, ...filtered];
      });

      // Nếu đang mở cuộc hội thoại này -> Cập nhật thông tin chi tiết (ví dụ: theme, quickEmoji, seenBy,...)
      if (currentConversation && currentConversation._id === updatedConv._id) {
        setCurrentConversation(updatedConv);
      }
    };

    const handleMessageReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        )
      );
    };

    const handleMessageRecall = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                content: "Tin nhắn đã bị thu hồi",
                imageUrl: [],
                files: [],
                reactions: [],
                linkPreview: null,
                isRecall: true,
              }
            : msg
        )
      );

      setConversations((prev) =>
        prev.map((c) => {
          if (c.lastMessage && c.lastMessage._id === messageId) {
            return {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                content: "Tin nhắn đã bị thu hồi",
              },
            };
          }
          return c;
        })
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("conversationUpdated", handleConversationUpdated);
    socket.on("messageReaction", handleMessageReaction);
    socket.on("messageRecall", handleMessageRecall);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("conversationUpdated", handleConversationUpdated);
      socket.off("messageReaction", handleMessageReaction);
      socket.off("messageRecall", handleMessageRecall);
    };
  }, [socket, currentConversation]);

  useEffect(() => {
    if (userCurrent) {
      fetchConversations(1, false);
    } else {
      setConversations([]);
      setError("");
    }
  }, [userCurrent]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        isLoading,
        error,
        page,
        hasMore,
        isLoadingMore,
        currentConversation,
        messagesLoading,
        messagesHasMore,
        messagesPage,

        setConversations,
        setMessages,
        setIsLoading,
        setError,
        setPage,
        setHasMore,
        setIsLoadingMore,
        setCurrentConversation,

        selectConversationById,
        fetchChatMessages,
        sendMessage,
        handleReact,
        handleRecallMessage,
        handleDeleteMessageForMe,
        updateCustomization,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
