import { BadgeCheck, X } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import moment from "moment";

const StoryView = ({ viewStory, setViewStory }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [process, setProcess] = useState(0);
  const videoRef = useRef(null);

  const stories = viewStory?.stories || [];
  const user = viewStory?.user;
  const currentStory = stories[currentIndex];

  const handleClose = () => {
    setViewStory(null);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setViewStory(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setProcess(0);
    }
  };

  const handleVideoTimeUpdate = (e) => {
    const video = e.target;
    if (video.duration) {
      setProcess((video.currentTime / video.duration) * 100);
    }
  };

  useEffect(() => {
    if (!currentStory) return;

    setProcess(0);
    let timer, progressInterval;

    if (currentStory.media?.type !== "video") {
      const duration = 5000; // 5 seconds per story
      const setTime = 100;
      let elapsed = 0;

      progressInterval = setInterval(() => {
        elapsed = elapsed + setTime;
        setProcess(Math.min((elapsed / duration) * 100, 100));
      }, setTime);

      timer = setTimeout(() => {
        handleNext();
      }, duration);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [currentIndex, viewStory]);

  // Handle explicit video load and play to guarantee playback in all browsers
  useEffect(() => {
    if (currentStory?.media?.type === "video" && videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Autoplay was prevented or failed:", error);
        });
      }
    }
  }, [currentIndex, currentStory]);

  const getSecureUrl = (url) => {
    if (!url) return "";
    return url.replace(/^http:\/\//i, "https://");
  };

  if (!viewStory || !currentStory) {
    return null;
  }

  const renderContent = () => {
    const mediaUrl = getSecureUrl(currentStory.media?.url);
    switch (currentStory.media?.type) {
      case "image":
        return (
          <img
            className="max-w-full max-h-screen object-contain select-none pointer-events-none"
            src={mediaUrl}
            alt=""
          />
        );
      case "video":
        return (
          <video
            ref={videoRef}
            src={mediaUrl}
            className="max-h-screen select-none"
            autoPlay
            controls
            playsInline
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleNext}
            onError={(e) => console.error("Video load error:", e)}
          />
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center select-none">
            {currentStory.content}
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 h-screen bg-black bg-opacity-95 z-110 flex items-center justify-center select-none"
      style={{
        backgroundColor: currentStory.background_color || "#000000",
      }}
    >
      {/* Navigation Areas */}
      <div
        onClick={handlePrev}
        className="absolute left-0 top-0 bottom-0 w-[30%] cursor-pointer z-10"
      />
      <div
        onClick={handleNext}
        className="absolute right-0 top-0 bottom-0 w-[70%] cursor-pointer z-10"
      />

      {/* Segmented Process bars */}
      <div className="absolute top-2 left-0 w-full px-2 sm:px-4 flex gap-1.5 z-30">
        {stories.map((s, idx) => {
          let widthVal = "0%";
          if (idx < currentIndex) {
            widthVal = "100%";
          } else if (idx === currentIndex) {
            widthVal = `${process}%`;
          }
          return (
            <div key={idx} className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 linear"
                style={{ width: widthVal }}
              ></div>
            </div>
          );
        })}
      </div>

      {/* User Info - Top-left */}
      <div className="absolute top-5 left-4 flex items-center space-x-3 p-2 px-3 sm:px-4 backdrop-blur-md rounded-full bg-black/40 z-30">
        <img
          src={user?.profile_picture}
          className="size-8 sm:size-9 rounded-full object-cover border border-white"
          alt=""
        />
        <div className="flex flex-col text-white">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm sm:text-base">{user?.full_name}</span>
            <BadgeCheck size={16} className="text-blue-400 fill-blue-400" />
          </div>
          <span className="text-[10px] sm:text-xs opacity-75">{moment(currentStory.createdAt).fromNow()}</span>
        </div>
      </div>

      {/* close button */}
      <button
        onClick={handleClose}
        className="absolute top-5 right-4 text-white text-3xl font-bold focus:outline-none z-30"
      >
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer drop-shadow-md" />
      </button>

      {/* Content Wrapper */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center z-20">
        {renderContent()}
      </div>
    </div>
  );
};

export default StoryView;
