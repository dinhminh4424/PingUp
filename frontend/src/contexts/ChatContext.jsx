import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import {
  getConversations,
  getConversationById,
  updateConversationCustomization,
} from "../services/ConversationServices";

import {
  getMessages,
  sendMessage as sendMessageApi,
  reactToMessage,
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
      }

      // 2. Cập nhật tin nhắn cuối cùng (lastMessage) của cuộc hội thoại đó trong danh sách bên trái
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv._id === msg.conversationId) {
            return {
              ...conv,
              lastMessage: {
                content: msg.content,
                senderId: msg.senderId?._id || msg.senderId,
                createAt: msg.createdAt,
              },
              lastMessageAt: msg.createdAt,
            };
          }
          return conv;
        });

        // Tùy chọn: Đưa cuộc hội thoại có tin nhắn mới lên đầu danh sách
        return updated.sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
      });
    };

    const handleMessageReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        )
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageReaction", handleMessageReaction);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageReaction", handleMessageReaction);
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
        updateCustomization,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
