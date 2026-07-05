import React, { useState, useEffect } from "react";

const MediaModal = ({ isOpen, onClose, mediaList, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!isOpen || !mediaList || mediaList.length === 0) return null;

  const currentMedia = mediaList[currentIndex];
  // Detect if the URL points to a video
  const isVideo = currentMedia.match(/\.(mp4|webm|ogg|mov)$/i) || currentMedia.includes("video/upload");

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center select-none">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-black/40 hover:bg-black/60 cursor-pointer text-xl font-bold font-sans z-50 transition size-10 flex items-center justify-center"
      >
        ×
      </button>

      {/* Left navigation */}
      {currentIndex > 0 && (
        <button 
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="absolute left-6 text-white hover:text-slate-300 p-3 rounded-full bg-black/40 hover:bg-black/60 cursor-pointer text-xl font-bold z-50 transition size-12 flex items-center justify-center"
        >
          ‹
        </button>
      )}

      {/* Center content */}
      <div className="max-w-[85vw] max-h-[85vh] flex items-center justify-center">
        {isVideo ? (
          <video 
            src={currentMedia} 
            controls 
            autoPlay
            className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl" 
          />
        ) : (
          <img 
            src={currentMedia} 
            className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl transition duration-200" 
            alt="" 
          />
        )}
      </div>

      {/* Right navigation */}
      {currentIndex < mediaList.length - 1 && (
        <button 
          onClick={() => setCurrentIndex(prev => prev + 1)}
          className="absolute right-6 text-white hover:text-slate-300 p-3 rounded-full bg-black/40 hover:bg-black/60 cursor-pointer text-xl font-bold z-50 transition size-12 flex items-center justify-center"
        >
          ›
        </button>
      )}

      {/* Slide Indicator */}
      <div className="absolute bottom-6 bg-black/40 text-white text-xs px-3.5 py-1.5 rounded-full font-semibold">
        {currentIndex + 1} / {mediaList.length}
      </div>
    </div>
  );
};

export default MediaModal;
