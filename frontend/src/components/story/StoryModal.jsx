import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { createPost } from "../../services/StoryServices.js";

const StoryModal = ({ setShowModal, fetchStories }) => {
  const bgColors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#e11d48",
    "#ca8a04",
    "#0d9488",
  ];

  const textColors = [
    "#FFFFFF",
    "#000000",
    "#f3f4f6",
    "#fef08a",
    "#86efac",
    "#93c5fd",
    "#f472b6",
  ];

  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [textColor, setTextColor] = useState(textColors[0]);

  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateStory = async () => {
    try {
      const formData = new FormData();
      formData.append("content", text);
      formData.append("background_color", background);
      formData.append("text_color", textColor);
      if (media) {
        formData.append("media", media);
      }

      const result = await createPost(formData);

      console.log("result story: ", result);
      if (result.success) {
        console.log("Create Story Success: ", result.story);
        fetchStories();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error : ", error);
      toast.error(error.response?.data?.message || "Error creating story !!!!");
    }
  };

  return (
    <div className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowModal(false)}
            className="text-white p-2 cursor-pointer"
          >
            <ArrowLeft className="" />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>
        <div
          className="rounded-lg h-96 flex items-center justify-center relative"
          style={{ backgroundColor: background }}
        >
          {mode === "text" && (
            <textarea
              className="bg-transparent w-full h-full p-6 text-lg resize-none focus-within:outline-none"
              style={{ color: textColor }}
              placeholder="What are you thinking about?"
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          )}
          {mode === "media" &&
            previewUrl &&
            (media?.type.startsWith("image") ? (
              <img src={previewUrl} className="object-contain max-h-full " />
            ) : (
              <video src={previewUrl} className="object-contain max-h-full" />
            ))}
        </div>
        {mode === "text" && (
          <div className="flex flex-col gap-3 mt-4">
            <div>
              <span className="text-xs text-zinc-400 block mb-1">Background Color</span>
              <div className="flex gap-2 items-center flex-wrap">
                {bgColors.map((color) => (
                  <button
                    key={color}
                    className={`rounded-full w-6 h-6 ring cursor-pointer transition ${
                      background === color ? "ring-white ring-2 scale-110" : "ring-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBackground(color)}
                  ></button>
                ))}
                {/* Custom Background Color Picker */}
                <label className="relative rounded-full w-6 h-6 border border-zinc-500 cursor-pointer overflow-hidden flex items-center justify-center bg-zinc-800 hover:scale-105 transition">
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                  />
                  <span className="text-xs font-bold text-zinc-300">+</span>
                </label>
              </div>
            </div>
            <div>
              <span className="text-xs text-zinc-400 block mb-1">Text Color</span>
              <div className="flex gap-2 items-center flex-wrap">
                {textColors.map((color) => (
                  <button
                    key={color}
                    className={`rounded-full w-6 h-6 ring cursor-pointer transition border border-zinc-700 ${
                      textColor === color ? "ring-white ring-2 scale-110" : "ring-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setTextColor(color)}
                  ></button>
                ))}
                {/* Custom Text Color Picker */}
                <label className="relative rounded-full w-6 h-6 border border-zinc-500 cursor-pointer overflow-hidden flex items-center justify-center bg-zinc-800 hover:scale-105 transition">
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                  />
                  <span className="text-xs font-bold text-zinc-300">+</span>
                </label>
              </div>
            </div>
          </div>
        )}
        {/* nút trạng thái  */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setMode("text");
              setPreviewUrl(null);
              setMedia(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer
                ${mode === "text" ? "bg-white text-black" : "bg-zinc-800"}`}
          >
            <TextIcon size={18} />
            Text
          </button>
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer
                ${mode === "media" ? "bg-white text-black" : "bg-zinc-800"}`}
          >
            <input
              onChange={(e) => {
                handleMediaUpload(e);
                setMode("media");
              }}
              type="file"
              accept="image/*, video/*"
              className="hidden"
            />
            <Upload size={18} />
            Photo/Video
          </label>
        </div>
        {/*  */}
        <button
          onClick={() =>
            toast.promise(handleCreateStory(), {
              loading: "Saving .......",
              success: <p>Story đã đựơc đăng</p>,
              error: (e) => <p>{e.message}</p>,
            })
          }
          className=" flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition cursor-pointer"
        >
          <Sparkle size={18} />
          Create story
        </button>
      </div>
    </div>
  );
};

export default StoryModal;
