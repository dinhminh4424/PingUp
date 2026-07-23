import React, { useEffect, useRef } from "react";
import Loading from "../../components/Loading.jsx";
import StoryBar from "../../components/story/StoryBar.jsx";
import PostCard from "../../components/post/PostCard.jsx";
import ResentMessages from "../../components/feed/ResentMessages.jsx";
import OnlineUsers from "../../components/feed/OnlineUsers.jsx";
import { Loader2 } from "lucide-react";
import { useFeed } from "../../contexts/FeedContext.jsx";
import Sponsored from "../../components/feed/Sponsored.jsx";
import AdContainer from "../../components/ads/AdContainer.jsx";

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
          {feeds.map((feed, index) => {
            const showAd = index > 0 && index % 4 === 0;
            return (
              <React.Fragment key={feed._id}>
                {showAd && (
                  <AdContainer
                    placementCode="FEED_NATIVE"
                    className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow p-4 w-full max-w-2xl flex flex-col gap-2.5 cursor-pointer"
                  />
                )}
                <PostCard
                  post={feed}
                  onUpdate={handleUpdatePost}
                  onDelete={handleDeletePost}
                  onToggleLikePost={handleToggleLikePost}
                />
              </React.Fragment>
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
              Loading more articles...
            </div>
          )}
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="max-xl:hidden sticky top-4 max-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar w-80 flex flex-col gap-4">
        <Sponsored />
        <OnlineUsers />
        <ResentMessages />
      </div>
    </div>
  );
};

export default Feed;
