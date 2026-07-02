import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import toast from "react-hot-toast";

import { getPost } from "../services/PostServices.js";

const FeedContext = createContext();

export const FeedProvider = ({ children }) => {
  const { socket } = useSocket();

  const [feeds, setFeeds] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleUpdatePost = (updatedPost) => {
    setFeeds((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)),
    );
  };

  const handleDeletePost = (deletePostId) => {
    setFeeds((prev) => prev.filter((post) => post._id !== deletePostId));
  };

  const fetchFeeds = async (pageNumber = 1, append = false) => {
    try {
      if (pageNumber === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError("");
      const limit = 5;
      const result = await getPost(pageNumber, limit);

      if (result.success) {
        if (append) {
          setFeeds((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));

            const newPosts = (result.posts || []).filter(
              (p) => !existingIds.has(p._id),
            );

            return [...prev, ...newPosts];
          });
        } else {
          setFeeds(result.posts || []);
        }

        if (result.pagination) {
          setPage(result.pagination.currentPage);
          setHasMore(result.pagination.hasMore);
        }
      } else {
        if (!append) setFeeds([]);
        setHasMore(false);
      }
    } catch (error) {
      console.log("LỖI: ", error);
      setError("Lỗi: " + error);
      if (!append) setFeeds([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (data) => {
      console.log("Nhận Bài viết mới từ socket: ", data);
      const post = data?.post;
      if (!post) return;

      // Hiển thị toast thông báo
      toast(
        <div className="flex items-center gap-3">
          <img
            src={post.user?.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
            alt=""
            className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-gray-100"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
            }}
          />

          <div>
            <div className="font-semibold text-gray-800">
              {post.user?.full_name || post.user?.username || "Một người dùng"}
            </div>
            <div className="text-xs text-gray-500">đã đăng bài viết mới</div>
          </div>
        </div>,
        {
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "#fff",
            color: "#333",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          },
        },
      );

      // Cập nhật danh sách bài viết cục bộ
      setFeeds((prev) => {
        if (prev.some((p) => p._id === post._id)) return prev;

        return [post, ...prev];
      });
    };

    socket.on("post:new", handleNewPost);

    return () => {
      socket.off("post:new", handleNewPost);
    };
  }, [socket]);

  useEffect(() => {
    fetchFeeds(1, false);
  }, []);

  return (
    <FeedContext.Provider
      value={{
        feeds,
        isLoading,
        error,
        page,
        hasMore,
        isLoadingMore,
        setFeeds,
        setIsLoading,
        setError,
        setPage,
        setHasMore,
        setIsLoadingMore,

        handleUpdatePost,
        handleDeletePost,
        fetchFeeds,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => useContext(FeedContext);
