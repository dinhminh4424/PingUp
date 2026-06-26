import React, { useEffect, useState } from "react";
import { assets, dummyPostsData } from "../assets/assets.js";
import Loading from "../components/Loading.jsx";
import StoryBar from "../components/StoryBar.jsx";
import PostCard from "../components/PostCard.jsx";
import ResentMessages from "../components/ResentMessages.jsx";

import { getPost } from "../services/PostServices.js";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeeds = async () => {
    // setFeeds(dummyPostsData);

    try {
      setIsLoading(true);
      setError("");
      const result = await getPost();

      setFeeds(result.posts);
    } catch (error) {
      console.log("LỖI: ", error);
      setError("Lỗi: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return !isLoading ? (
    <div className="h-full  overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* Story và post list */}
      <div>
        <StoryBar />
        {error && <h2 className="text-red-500">{error}</h2>}
        <div className="d-4 space-y-6">
          {feeds.map((feed) => {
            return <PostCard key={feed._id} post={feed} />;
          })}
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
  ) : (
    <Loading />
  );
};

export default Feed;
