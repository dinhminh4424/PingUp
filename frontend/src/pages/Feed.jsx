import React, { useEffect, useRef } from "react";
import { assets } from "../assets/assets.js";
import Loading from "../components/Loading.jsx";
import StoryBar from "../components/story/StoryBar.jsx";
import PostCard from "../components/post/PostCard.jsx";
import ResentMessages from "../components/ResentMessages.jsx";
import { Loader2 } from "lucide-react";
import { useFeed } from "../contexts/FeedContext.jsx";

const Feed = () => {
  const loaderRef = useRef(null);

  const {
    feeds,
    isLoading,
    error,
    page,
    hasMore,
    isLoadingMore,

    handleUpdatePost,
    handleDeletePost,
    handleToggleLikePost,
    fetchFeeds,
  } = useFeed();

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchFeeds(page + 1, true);
        }
      },
      { threshold: 0.1 },
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
                onToggleLikePost={handleToggleLikePost}
              />
            );
          })}
        </div>

        {/* Sentinel div phục vụ tự động Infinite Scroll */}
        <div
          ref={loaderRef}
          className="h-16 flex items-center justify-center mt-6"
        >
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
