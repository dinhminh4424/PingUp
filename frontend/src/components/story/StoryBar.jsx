import React, { useEffect, useRef, useState } from "react";
import { dummyStoriesData } from "../../assets/assets.js";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModal from "./StoryModal.jsx";
import StoryView from "../StoryView.jsx";

const StoryBar = () => {
  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewStory, setViewStory] = useState(null);

  const scrollRef = useRef(null);

  const fetchStories = async () => {
    setStories(dummyStoriesData);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleWheel = (e) => {
    const container = scrollRef.current;
    if (!container) return;

    // chặn scroll dọc mặc định
    e.preventDefault();

    // chuyển scroll dọc thành ngang
    container.scrollBy({
      left: e.deltaY * 1.2, // 👈 chỉnh tốc độ ở đây
      behavior: "smooth", // 👈 mượt
    });
  };

  return (
    <div
      ref={scrollRef}
      onWheel={handleWheel}
      className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4 "
    >
      <div className="flex gap-4 pb-5">
        {/* add story card */}
        <div
          onClick={() => setShowModal(true)}
          className="rounded-lg shadow-sm min-w-30 max-w-30 max-h 40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white"
        >
          <div className="h-full flex flex-col items-center justify-center p-4 ">
            <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-700 text-center">
              Create Story
            </p>
          </div>
        </div>

        {/* story card */}
        {stories.map((story, index) => {
          return (
            <div
              onClick={() => setViewStory(story)}
              key={index}
              className={`relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all   duration-200 bg-gradient-to-b from-indigo-500 to-purple-600  hover:from-indigo-700 hover:to-purple-800 active:scale-95
                  `}
            >
              <img
                src={story.user.profile_picture}
                alt=""
                className="absolute size-8 left-3 top-3 z-10 rounded-full ring ring-gray-100 shadow"
              />
              <p className="absolute top-18 left-3 text-white/60  text-sm truncate max-w-24">
                {story.content}
              </p>
              <p className="absolute text-white  bottom-1 right-2 z-10 text-sm">
                {moment(story.createdAt).fromNow()}
              </p>
              {story.media_type !== "text" && (
                <div className="absolute inset-0 z-1 rounded-lg bg-black overflow-hidden">
                  {story.media_type === "image" ? (
                    <img
                      src={story.media_url}
                      className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                    />
                  ) : (
                    <video
                      src={story.media_url}
                      className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                    ></video>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Story Card  */}
      {showModal && (
        <StoryModal setShowModal={setShowModal} fetchStories={fetchStories} />
      )}
      {/* View Story Modal */}
      {viewStory && (
        <StoryView viewStory={viewStory} setViewStory={setViewStory} />
      )}
    </div>
  );
};

export default StoryBar;
