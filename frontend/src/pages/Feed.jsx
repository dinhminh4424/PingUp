import React, { useEffect, useState, useRef } from "react";
import { assets, dummyPostsData } from "../assets/assets.js";
import Loading from "../components/Loading.jsx";
import StoryBar from "../components/story/StoryBar.jsx";
import PostCard from "../components/post/PostCard.jsx";
import ResentMessages from "../components/ResentMessages.jsx";
import { Loader2 } from "lucide-react";

import { getPost } from "../services/PostServices.js";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loaderRef = useRef(null);

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
          setFeeds((prev) => [...prev, ...(result.posts || [])]);
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
    fetchFeeds(1, false);
  }, []);

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchFeeds(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, page, isLoading, isLoadingMore]);

  if (isLoading && page === 1) {
    return <Loading />;
  }

  return (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* Story và post list */}
      <div>
        <StoryBar />
        {error && <h2 className="text-red-500">{error}</h2>}
        <div className="d-4 space-y-6">
          {feeds.map((feed) => {
            return (
              <PostCard
                key={feed._id}
                post={feed}
                onUpdate={handleUpdatePost}
                onDelete={handleDeletePost}
              />
            );
          })}
        </div>

        {/* Sentinel div phục vụ tự động Infinite Scroll */}
        <div ref={loaderRef} className="h-16 flex items-center justify-center mt-6">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tải thêm bài viết...
            </div>
          )}
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-sm bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3 className="text-slate-800 font-semibold">Sponsored</h3>
          <img
            src={assets.sponsored_img}
            className="w-75 h-50 rounded-md "
            alt=""
          />
          <p className="text-slate-600">Email Marketing</p>
          <p className="text-slate-400">
            Superchange your marketing with a powerful, easy-to-use platform for
            result built
          </p>
        </div>
        <h1>
          <ResentMessages />
        </h1>
      </div>
    </div>
  );
};

export default Feed;
