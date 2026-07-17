import React from "react";
import { X, Smile, FileText, ImageIcon, Paperclip, SendHorizonal, Reply } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";

const MessageInput = ({
  text,
  setText,
  images,
  setImages,
  filesToSend,
  setFilesToSend,
  showEmojiPicker,
  setShowEmojiPicker,
  replyingTo,
  setReplyingTo,
  linkPreview,
  setLinkPreview,
  showLinkPreview,
  setShowLinkPreview,
  isLoadingPreview,
  isSending,
  handleSendMessage,
  currentConversation,
  userCurrent,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-[#f4f5f7] border-t border-gray-200 z-10">
      {replyingTo && (
        <div className="flex items-center justify-between p-2 px-4 bg-slate-100 rounded-lg max-w-xl mx-auto mb-2 border-l-4 border-indigo-500 shadow-sm relative">
          <div className="flex items-center gap-2">
            <Reply className="size-4 text-indigo-500" />
            <div className="text-xs">
              <span className="font-bold text-slate-800">
                Đang trả lời{" "}
                {replyingTo.senderId?._id === userCurrent?._id
                  ? "chính mình"
                  : replyingTo.senderId?.full_name || "Thành viên"}
              </span>
              <p className="text-gray-500 truncate max-w-[300px] mt-0.5">
                {replyingTo.content ||
                  (replyingTo.imageUrl?.length > 0
                    ? "[Hình ảnh]"
                    : replyingTo.files?.length > 0
                      ? "[Tệp tin]"
                      : "")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-slate-200 rounded-full transition cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {showLinkPreview && linkPreview && (
        <div className="relative flex items-center gap-3 p-3 bg-white max-w-xl mx-auto rounded-xl border border-indigo-100 shadow-md mb-2 overflow-hidden">
          {linkPreview.image && (
            <img
              src={linkPreview.image}
              alt=""
              className="size-16 object-cover rounded-md border border-gray-100 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0 pr-6">
            <p className="font-semibold text-slate-800 text-[13px] truncate">
              {linkPreview.title}
            </p>
            {linkPreview.description && (
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                {linkPreview.description}
              </p>
            )}
            <p className="text-[10px] text-indigo-600 font-medium mt-1">
              {linkPreview.domain || linkPreview.siteName || "Link preview"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowLinkPreview(false);
              setLinkPreview(null);
            }}
            className="absolute top-2.5 right-2.5 p-1 hover:bg-slate-100 rounded-full transition cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 shadow-2xl rounded-xl overflow-hidden">
          <EmojiPicker
            onEmojiClick={(emojiData) =>
              setText((prev) => prev + emojiData.emoji)
            }
          />
        </div>
      )}

      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2 max-w-xl mx-auto bg-white p-2 rounded-lg shadow border border-gray-100">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative size-14 bg-slate-50 rounded border border-gray-200"
            >
              <img
                src={URL.createObjectURL(img)}
                className="size-full object-cover rounded"
                alt=""
              />
              <button
                type="button"
                onClick={() =>
                  setImages((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full size-4.5 flex items-center justify-center text-[10px] font-bold shadow cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {filesToSend.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2 max-w-xl mx-auto bg-white p-2 rounded-lg shadow border border-gray-100">
          {filesToSend.map((f, i) => (
            <div
              key={i}
              className="relative flex items-center gap-2 p-1.5 bg-slate-50 border border-gray-200 rounded"
            >
              <FileText className="size-5 text-emerald-600" />
              <span className="text-xs truncate max-w-[120px]">{f.name}</span>
              <button
                type="button"
                onClick={() =>
                  setFilesToSend((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="bg-red-500 hover:bg-red-600 text-white rounded-full size-4 flex items-center justify-center text-[10px] font-bold shadow cursor-pointer ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5 relative">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`p-1 hover:bg-slate-100 rounded-full transition cursor-pointer ${
            showEmojiPicker ? "text-indigo-600 bg-indigo-50" : "text-slate-400"
          }`}
        >
          <Smile className="size-6" />
        </button>

        <textarea
          className="flex-1 outline-none text-slate-700 bg-transparent resize-none py-1 max-h-24 min-h-[28px] text-sm align-middle leading-normal"
          placeholder="Type a message ... "
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
              e.target.style.height = "auto";
            }
          }}
        />

        <label
          htmlFor="image"
          className="cursor-pointer p-1 hover:bg-slate-100 rounded-full transition flex items-center justify-center"
        >
          <ImageIcon className="size-6.5 text-gray-400" />
          <input
            type="file"
            hidden
            multiple
            id="image"
            accept="image/*"
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files);
              const oversized = selectedFiles.filter((f) => f.size > 10 * 1024 * 1024);
              if (oversized.length > 0) {
                toast.error("Tệp ảnh không được vượt quá 10MB!");
              }
              const allowed = selectedFiles.filter((f) => f.size <= 10 * 1024 * 1024);
              setImages((prev) => [...prev, ...allowed]);
            }}
          />
        </label>

        <label
          htmlFor="file-input"
          className="cursor-pointer p-1 hover:bg-slate-100 rounded-full transition flex items-center justify-center mr-1"
        >
          <Paperclip className="size-6 text-gray-400" />
          <input
            type="file"
            hidden
            multiple
            id="file-input"
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files);
              const oversized = selectedFiles.filter((f) => f.size > 10 * 1024 * 1024);
              if (oversized.length > 0) {
                toast.error("Tệp tin đính kèm không được vượt quá 10MB!");
              }
              const allowed = selectedFiles.filter((f) => f.size <= 10 * 1024 * 1024);
              allowed.forEach((file) => {
                const isImage =
                  file.type.startsWith("image/") ||
                  file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                if (isImage) {
                  setImages((prev) => [...prev, file]);
                } else {
                  setFilesToSend((prev) => [...prev, file]);
                }
              });
            }}
          />
        </label>

        {text.trim() || images.length > 0 || filesToSend.length > 0 ? (
          <button
            onClick={() => handleSendMessage()}
            disabled={isSending}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[34px] min-h-[34px]"
          >
            {isSending ? (
              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SendHorizonal size={18} />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              handleSendMessage(currentConversation?.quickEmoji || "👍")
            }
            className="text-2xl hover:scale-115 active:scale-95 transition cursor-pointer select-none"
          >
            {currentConversation?.quickEmoji || "👍"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
