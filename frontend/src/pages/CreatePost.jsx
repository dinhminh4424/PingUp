import React, { useState, useRef, useEffect } from "react";
// import { dummyUserData } from "../assets/assets";
import { Image, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { createPost } from "../services/PostServices";
import EmojiPicker from "emoji-picker-react";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [loadings, setLoadings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  const { userCurrent: user } = useAuth();

  // Tự động điều chỉnh chiều cao của textarea theo nội dung
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // const user = dummyUserData;

  const handleSubmit = async () => {
    try {
      setLoadings(true);
      const result = await createPost({ content, images });
      setContent("");
      setImages([]);
      setError("");
      setShowEmojiPicker(false);
      return result;
    } catch (error) {
      console.log("Lỗi: ", error);
      setError(error.response?.data?.message || "Post creation failed");
      throw error;
    } finally {
      setLoadings(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create Post
          </h1>
          <p className="text-slate-600">Share your thoughts with the world</p>
        </div>
        {/* Form */}
        <div className="max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4 relative">
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture || "/default-avatar.avif"}
              className="w-12 h-12 rounded-full shadow"
              alt=""
            />
            <div>
              <h2 className="font-semibold">{user.full_name}</h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
          {error && <p className="text-red-600"> {error}</p>}

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            className="w-full resize-none mt-4 text-sm outline-none placeholder-gray-400 overflow-hidden animate-fade-in"
            placeholder="What is happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
            rows={3}
          />

          {/* Images */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {images.map((image, index) => (
                <div className="relative group" key={index}>
                  <img
                    src={URL.createObjectURL(image)}
                    className="h-20 rounded-md "
                  />
                  <div
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== index))
                    }
                    className="absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer"
                  >
                    <X className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-300">
            <div className="flex items-center gap-4 relative">
              <label
                htmlFor="images"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
                title="Attach image"
              >
                <Image className="size-6" />
              </label>
              <input
                type="file"
                id="images"
                accept="image/*"
                hidden
                multiple
                onChange={(e) => setImages([...images, ...e.target.files])}
              />

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-500 hover:text-gray-700 transition cursor-pointer flex items-center justify-center"
                title="Add emoji"
              >
                <Smile className="size-6" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-10 left-0 z-50 shadow-2xl rounded-xl overflow-hidden border border-gray-100">
                  <EmojiPicker
                    onEmojiClick={(emojiData) =>
                      setContent((prev) => prev + emojiData.emoji)
                    }
                    width={280}
                    height={320}
                    searchDisabled={false}
                    skinTonesDisabled={true}
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
            </div>

            <button
              disabled={loadings}
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: "upLoading ...",
                  success: <p>Post Added</p>,
                  error: <p>Post Not Added</p>,
                })
              }
              className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer"
            >
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
