import React, { useState } from "react";
import {
  MessageSquare,
  Star,
  Smile,
  ThumbsUp,
  Heart,
  CheckCircle2,
  X,
  Upload,
} from "lucide-react";

import { createFeedBack } from "../../services/FeedBackServices";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("suggestion");
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));
    setMediaFiles((prev) => [...prev, ...newMedia]);
  };

  const handleRemoveMedia = (indexToRemove) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[indexToRemove].url);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("rating", rating);
      formData.append("comment", comment);
      mediaFiles.forEach((m) => {
        formData.append("media", m.file);
      });

      const result = await createFeedBack(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.message || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error("Lỗi gửi feedback: ", err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: "suggestion", label: "Suggestion", icon: Smile },
    { id: "bug", label: "Bug Report", icon: MessageSquare },
    { id: "compliment", label: "Compliment", icon: ThumbsUp },
    { id: "other", label: "Other", icon: Heart },
  ];

  if (submitted) {
    return (
      <div className="relative h-full overflow-y-auto bg-slate-50 p-6 md:p-10 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center flex flex-col items-center gap-5 py-12 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank you!
            </h2>
            <p className="text-gray-500 text-sm">
              Your feedback has been submitted successfully. We appreciate your
              input to make PingUp better.
            </p>
          </div>
          <button
            onClick={() => {
              // Revoke any created URLs to free up memory
              mediaFiles.forEach((m) => URL.revokeObjectURL(m.url));
              setSubmitted(false);
              setRating(0);
              setComment("");
              setCategory("suggestion");
              setMediaFiles([]);
            }}
            className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition active:scale-95 cursor-pointer"
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto bg-slate-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback</h1>
        <p className="text-gray-500 mb-8">
          We would love to hear your thoughts, suggestions, or issues you've
          encountered.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col gap-6"
        >
          {/* Category */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              What kind of feedback is this?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer ${
                      category === cat.id
                        ? "border-indigo-600 bg-indigo-50/20 text-indigo-700 font-semibold"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-2" />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Rate your experience
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer transition transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Your Message
            </label>
            <textarea
              required
              rows={5}
              placeholder="Tell us what's on your mind..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/30"
            />
          </div>

          {/* Attachments */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Attach Images or Videos (Optional)
            </label>
            <div className="flex flex-wrap gap-3 items-center">
              <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-500/50 hover:bg-indigo-50/10 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition select-none text-slate-400 hover:text-indigo-600">
                <Upload className="w-5 h-5" />
                <span className="text-[10px] font-semibold">Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                />
              </label>

              {mediaFiles.map((m, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50"
                >
                  {m.type === "video" ? (
                    <video
                      src={m.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={m.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/85 text-white rounded-full transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-2xl flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm transition active:scale-95 shadow-lg shadow-indigo-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
