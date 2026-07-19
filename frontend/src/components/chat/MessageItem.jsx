import React from "react";
import {
  FileText,
  Smile,
  MoreVertical,
  Reply,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const renderMessageContent = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part) || part.match(/^https?:\/\//i)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline break-all font-medium"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const MessageItem = ({
  message,
  index,
  userCurrent,
  handleContextMenu,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  openImageModal,
  setSelectedReactionsMessage,
  handleReact,
  activeReactPickerMsgId,
  setActiveReactPickerMsgId,
  activeDropdownMsgId,
  setActiveDropdownMsgId,
  setMessageToRecall,
  setReplyingTo,
  handleDeleteMessageForMe,
}) => {
  const isMe = (message.senderId?._id || message.senderId) === userCurrent._id;
  const sender = message.senderId;

  return (
    <div
      className={`flex gap-3 group ${isMe ? "justify-end" : "justify-start"}`}
    >
      {!isMe && (
        <img
          src={sender?.profile_picture || "/default-avatar.avif"}
          className="size-8.5 rounded-full object-cover border border-gray-200 mt-1 flex-shrink-0"
          alt=""
        />
      )}
      <div
        className={`flex flex-col max-w-[65%] ${isMe ? "items-end" : "items-start"}`}
      >
        <div
          onContextMenu={handleContextMenu(message._id)}
          onTouchStart={handleTouchStart(message._id)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`p-2.5 px-3.5 text-sm rounded-lg shadow-sm border border-slate-105 relative cursor-pointer select-none ${
            isMe ? "bg-[#e6f2ff] text-slate-800" : "bg-white text-slate-800"
          }`}
        >
          {message.isRecall || message.content === "Tin nhắn đã bị thu hồi" ? (
            <p className="text-gray-400 italic text-xs select-none">
              Tin nhắn đã bị thu hồi
            </p>
          ) : (
            <>
              {message.replyTo && (
                <div className="mb-2 p-2 rounded bg-black/5 border-l-2 border-slate-400 text-[11px] text-slate-600">
                  <p className="font-bold text-[9px]">
                    {message.replyTo.senderId?._id === userCurrent._id
                      ? "Bạn"
                      : message.replyTo.senderId?.full_name || "Thành viên"}
                  </p>
                  <p className="truncate max-w-[200px]">
                    {message.replyTo.content ||
                      (message.replyTo.imageUrl?.length > 0
                        ? "[Hình ảnh]"
                        : message.replyTo.files?.length > 0
                          ? "[Tệp tin]"
                          : "")}
                  </p>
                </div>
              )}
              {message.imageUrl && message.imageUrl.length > 0 && (
                <div className="mb-2">
                  {(() => {
                    const imgs = message.imageUrl;
                    const count = imgs.length;
                    if (count === 1) {
                      return (
                        <div
                          className="cursor-pointer overflow-hidden rounded-lg max-h-80 max-w-sm"
                          onClick={() => openImageModal(imgs, 0)}
                        >
                          <img
                            src={imgs[0]}
                            className="w-full h-full object-cover hover:opacity-95 transition"
                            alt=""
                          />
                        </div>
                      );
                    }
                    if (count === 2) {
                      return (
                        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-w-sm">
                          {imgs.map((url, idx) => (
                            <div
                              key={idx}
                              className="cursor-pointer h-32"
                              onClick={() => openImageModal(imgs, idx)}
                            >
                              <img
                                src={url}
                                className="w-full h-full object-cover hover:opacity-95 transition"
                                alt=""
                              />
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden max-w-sm relative">
                        {imgs.slice(0, 3).map((url, idx) => {
                          const isLast = idx === 2;
                          const remaining = count - 3;
                          return (
                            <div
                              key={idx}
                              className="cursor-pointer h-20 relative"
                              onClick={() => openImageModal(imgs, idx)}
                            >
                              <img
                                src={url}
                                className="w-full h-full object-cover hover:opacity-95 transition"
                                alt=""
                              />
                              {isLast && remaining > 0 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm select-none">
                                  +{remaining}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
              {message.content && (
                <p className="break-words break-all whitespace-pre-wrap leading-relaxed">
                  {renderMessageContent(message.content)}
                </p>
              )}
              {message.linkPreview && (
                <a
                  href={message.linkPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex flex-col sm:flex-row gap-3 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg overflow-hidden transition text-left no-underline select-none max-w-sm"
                >
                  {message.linkPreview.image && (
                    <img
                      src={message.linkPreview.image}
                      alt=""
                      className="w-full sm:w-20 h-28 sm:h-20 object-cover rounded border border-gray-100 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-semibold text-slate-800 text-[12px] line-clamp-2 leading-snug">
                      {message.linkPreview.title}
                    </p>
                    {message.linkPreview.description && (
                      <p className="text-[10px] text-gray-500 line-clamp-1 mt-1">
                        {message.linkPreview.description}
                      </p>
                    )}
                    <p className="text-[9px] text-indigo-600 font-semibold mt-1 uppercase tracking-wide">
                      {message.linkPreview.domain || "Link"}
                    </p>
                  </div>
                </a>
              )}
              {message.files && message.files.length > 0 && (
                <div className="mt-2 space-y-1.5 min-w-[200px]">
                  {message.files.map((file, fileIdx) => {
                    const isVideo = file.name.match(/\.(mp4|webm|ogg|mov)$/i);
                    if (isVideo) {
                      return (
                        <div
                          key={fileIdx}
                          className="overflow-hidden rounded-lg max-w-sm mt-1 border border-gray-200 shadow-sm bg-black"
                        >
                          <video
                            src={file.url}
                            controls
                            className="w-full max-h-64 object-contain"
                          />
                        </div>
                      );
                    }
                    return (
                      <a
                        key={fileIdx}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-3 p-2 rounded border hover:bg-slate-50 transition cursor-pointer ${
                          isMe
                            ? "bg-white text-slate-800 border-blue-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="size-8.5 bg-emerald-50 rounded flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <FileText className="size-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate text-slate-800">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {file.size || "Unknown size"}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {message.reactions && message.reactions.length > 0 && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedReactionsMessage(message);
              }}
              className={`absolute bottom-[-24px] ${
                isMe ? "left-1" : "right-2"
              } flex items-center gap-0.5 bg-white border border-gray-100 px-3 py-0.5 rounded-full shadow-sm text-[10px] z-10 select-none cursor-pointer hover:bg-slate-50 active:scale-95 transition`}
            >
              {message.reactions.map((r, i) => (
                <div
                  key={i}
                  title={r.userId?.full_name || "Thành viên"}
                  className="text-lg flex justify-center items-center"
                >
                  <div className=""> {r.emoji}</div>
                </div>
              ))}
              {message.reactions.length > 1 && (
                <span className="text-[10px] text-slate-500 font-semibold pl-0.5">
                  {message.reactions.length}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-[10px] text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isMe && <span className="text-[10px] text-gray-400">✓ Đã nhận</span>}
        </div>
      </div>

      {/* Hover Action Bar */}
      <div
        className={`opacity-0 group-hover:opacity-100 transition duration-150 flex items-center gap-1 self-center ${
          isMe ? "order-first" : ""
        }`}
      >
        <div className="relative group/react">
          <button className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <Smile size={15} />
          </button>
          <div className="hidden group-hover/react:flex absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-gray-50 shadow-lg rounded-full p-1 gap-1.5 z-30 items-center">
            {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(message._id, emoji)}
                className="hover:scale-125 transition duration-100 p-0.5 cursor-pointer text-[19px] "
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => setActiveReactPickerMsgId(message._id)}
              className="hover:scale-125 transition duration-100 p-1 size-7 cursor-pointer text-[15px] font-bold text-slate-400 hover:text-indigo-600 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full"
            >
              +
            </button>
            {activeReactPickerMsgId === message._id && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveReactPickerMsgId(null);
                  }}
                ></div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 shadow-2xl rounded-xl overflow-hidden">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      handleReact(message._id, emojiData.emoji);
                      setActiveReactPickerMsgId(null);
                    }}
                    previewConfig={{ showPreview: false }}
                    skinTonesDisabled
                    height={300}
                    width={250}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Message actions dropdown menu (Zalo-style) */}
        <div className="relative">
          <button
            onClick={() =>
              setActiveDropdownMsgId(
                activeDropdownMsgId === message._id ? null : message._id,
              )
            }
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
            title="Tùy chọn"
          >
            <MoreVertical size={15} />
          </button>

          {activeDropdownMsgId === message._id && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setActiveDropdownMsgId(null)}
              ></div>
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-30 transform origin-top-right transition-all">
                <button
                  onClick={() => {
                    setReplyingTo(message);
                    setActiveDropdownMsgId(null);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <Reply size={13} className="text-indigo-500" />
                  <span>Trả lời</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(message.content || "");
                    setActiveDropdownMsgId(null);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <span>Sao chép văn bản</span>
                </button>
                <button
                  onClick={() => {
                    handleDeleteMessageForMe(message._id);
                    setActiveDropdownMsgId(null);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Xóa ở phía tôi</span>
                </button>
                {isMe && (
                  <button
                    onClick={() => {
                      setMessageToRecall(message);
                      setActiveDropdownMsgId(null);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-amber-600 hover:bg-amber-50 transition text-left cursor-pointer border-t border-gray-50"
                  >
                    <span>Thu hồi tin nhắn</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
