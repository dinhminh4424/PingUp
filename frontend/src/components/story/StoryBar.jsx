import React, { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModal from "./StoryModal.jsx";
import StoryView from "./StoryView.jsx";
import toast from "react-hot-toast";

import { getStoryForUser } from "../../services/StoryServices.js";
import { useSocket } from "../../contexts/SocketContext";

const StoryBar = () => {
  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewStory, setViewStory] = useState(null);
  const { socket } = useSocket();

  const scrollRef = useRef(null);

  const fetchStories = async () => {
    setStories([]);
    try {
      const result = await getStoryForUser();

      if (result.success) {
        setStories(result.stories);
      }
    } catch (error) {
      console.error("Lỗi : ", error);
      toast.error(error.response?.data?.message || "Lỗi lấy Story !!!");
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewStory = ({ story }) => {
      console.log("Nhận story mới từ socket: ", story);
      setStories((prevStories) => {
        const storyUserId = story.user._id.toString();
        const existingGroupIndex = prevStories.findIndex(
          (g) => g.user._id.toString() === storyUserId,
        );

        let updatedStories = [...prevStories];

        if (existingGroupIndex !== -1) {
          const group = { ...updatedStories[existingGroupIndex] };
          if (
            !group.stories.some(
              (s) => s._id.toString() === story._id.toString(),
            )
          ) {
            group.stories = [story, ...group.stories];
            group.latestStory = story.createdAt;
            group.hasViewed = false;
            updatedStories[existingGroupIndex] = group;
          }
        } else {
          const newGroup = {
            user: story.user,
            stories: [story],
            latestStory: story.createdAt,
            hasViewed: false,
          };
          updatedStories.push(newGroup);
        }

        updatedStories.sort((a, b) => {
          const aViewed = a.stories.every((s) => s.hasViewed);
          const bViewed = b.stories.every((s) => s.hasViewed);

          if (aViewed !== bViewed) {
            return aViewed ? 1 : -1;
          }

          return new Date(b.latestStory) - new Date(a.latestStory);
        });

        return updatedStories;
      });
    };

    socket.on("story:new", handleNewStory);

    return () => {
      socket.off("story:new", handleNewStory);
    };
  }, [socket]);

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
          const latestStoryItem = story.stories?.[0];
          return (
            <div
              onClick={() => latestStoryItem && setViewStory(story)}
              key={index}
              className={`relative rounded-lg shadow min-w-30 max-w-30 h-40 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95 overflow-hidden ${
                latestStoryItem?.story_type === "text"
                  ? ""
                  : "bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800"
              }`}
              style={{
                backgroundColor:
                  latestStoryItem?.story_type === "text"
                    ? latestStoryItem?.background_color
                    : undefined,
              }}
            >
              <img
                src={story.user?.profile_picture}
                alt=""
                className="absolute size-8 left-3 top-3 z-10 rounded-full ring ring-gray-100 shadow"
              />
              <p
                className="absolute inset-x-0 px-3 text-center top-1/2 -translate-y-1/2 text-sm font-medium line-clamp-3 overflow-hidden text-ellipsis whitespace-normal"
                style={{
                  color:
                    latestStoryItem?.story_type === "text"
                      ? latestStoryItem?.text_color
                      : "rgba(255,255,255,0.85)",
                }}
              >
                {latestStoryItem?.content}
              </p>
              <p className="absolute text-white bottom-1 right-2 z-10 text-[10px] opacity-80">
                {moment(
                  story.latestStory || latestStoryItem?.createdAt,
                ).fromNow()}
              </p>
              {latestStoryItem?.story_type !== "text" &&
                latestStoryItem?.media && (
                  <div className="absolute inset-0 z-1 rounded-lg bg-black overflow-hidden">
                    {latestStoryItem.media.type === "image" ? (
                      <img
                        src={latestStoryItem.media.url.replace(
                          /^http:\/\//i,
                          "https://",
                        )}
                        className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                      />
                    ) : (
                      <video
                        src={latestStoryItem.media.url.replace(
                          /^http:\/\//i,
                          "https://",
                        )}
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
