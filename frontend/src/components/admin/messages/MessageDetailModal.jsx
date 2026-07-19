import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, X, CornerDownRight } from "lucide-react";

const MessageDetailModal = ({
  conversation,
  messages,
  messagesLoading,
  messagesPage,
  messagesTotalPages,
  onClose,
  onDeleteMessage,
  onLoadMore,
  formatDate,
}) => {
  const getInitials = (name) => {
    if (!name) return "C";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getConversationDetails = (conv) => {
    if (conv.type === "group") {
      return {
        title: conv.group?.name || "Nhóm trò chuyện",
        image: conv.group?.imageGroup || "",
        fallback: getInitials(conv.group?.name || "Group"),
      };
    }
    const partner =
      conv.participants && conv.participants.length > 0
        ? conv.participants[0]?.userId
        : null;

    return {
      title: partner ? partner.full_name : "Người dùng PingUp",
      image: partner ? partner.profile_picture : "",
      fallback: partner ? getInitials(partner.full_name) : "U",
      username: partner ? `@${partner.username}` : "",
    };
  };

  const details = getConversationDetails(conversation);

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full h-[80vh] flex flex-col shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={details.image} />
              <AvatarFallback>{details.fallback}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {details.title}
              </h3>
              <p className="text-[10px] text-gray-500">
                Chi tiết hộp thoại ({details.username || "Nhóm"})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="p-4 overflow-y-auto flex-grow space-y-4 bg-gray-50/50 dark:bg-zinc-900/10 flex flex-col-reverse">
          {messagesLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-8 w-32" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-xs text-gray-400 py-12">
              Không có tin nhắn nào trong hộp thoại này
            </div>
          ) : (
            messages.map((msg) => {
              const isDeletedByAdmin =
                msg.content === "Tin nhắn này đã bị xóa bởi Admin";
              const isRecalled =
                msg.isRecall || msg.content === "Tin nhắn đã bị thu hồi";
              const isInactive = isDeletedByAdmin || isRecalled;

              return (
                <div
                  key={msg._id}
                  className="group relative flex items-start gap-2.5 p-2 hover:bg-gray-100/50 dark:hover:bg-zinc-900/40 rounded-lg transition-colors"
                >
                  <Avatar className="size-6 flex-shrink-0 border">
                    <AvatarImage src={msg.senderId?.profile_picture} />
                    <AvatarFallback>
                      {getInitials(msg.senderId?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {msg.senderId?.full_name}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>

                    {/* Reply To block */}
                    {msg.replyTo && (
                      <div className="mb-2 p-2 rounded bg-black/5 dark:bg-zinc-900/60 border-l-2 border-slate-400 text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                        <CornerDownRight
                          size={10}
                          className="mt-0.5 flex-shrink-0 text-slate-400"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[9px] text-slate-700 dark:text-slate-300">
                            Trả lời{" "}
                            {msg.replyTo.senderId?.full_name || "Thành viên"}
                          </p>
                          <p className="truncate max-w-[280px] text-[10px]">
                            {msg.replyTo.content ||
                              (msg.replyTo.imageUrl?.length > 0
                                ? "[Hình ảnh]"
                                : msg.replyTo.files?.length > 0
                                  ? "[Tệp tin]"
                                  : "")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Content text */}
                    <p
                      className={`text-xs whitespace-pre-wrap leading-relaxed mt-0.5 ${
                        isInactive
                          ? "text-gray-400 dark:text-gray-500 italic font-medium"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {msg.content}
                    </p>

                    {/* Attachment Images */}
                    {!isInactive && msg.imageUrl && msg.imageUrl.length > 0 && (
                      <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                        {msg.imageUrl.map((img, i) => (
                          <a
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={i}
                            className="aspect-square rounded border overflow-hidden"
                          >
                            <img
                              src={img}
                              alt="Chat Attachment"
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Message Reactions */}
                    {!isInactive &&
                      msg.reactions &&
                      msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {msg.reactions.map((r, i) => (
                            <span
                              key={i}
                              title={r.userId?.full_name || "Thành viên"}
                              className="inline-flex items-center gap-0.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 px-1.5 py-0.5 rounded-full text-[10px] shadow-2xs select-none"
                            >
                              <span>{r.emoji}</span>
                              {r.userId && (
                                <span className="text-[9px] text-gray-400">
                                  {r.userId.full_name ||
                                    `@${r.userId.username}`}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Moderation actions (Delete individual message) */}
                  {!isInactive && (
                    <button
                      onClick={() => onDeleteMessage(msg._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 border dark:border-zinc-800 shadow-xs rounded p-1 text-rose-500 absolute right-2 top-2"
                      title="Xóa tin nhắn (Kiểm duyệt)"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })
          )}

          {/* Load more messages button */}
          {messagesPage < messagesTotalPages && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                size="xs"
                onClick={onLoadMore}
                disabled={messagesLoading}
              >
                Tải thêm tin nhắn
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-zinc-900/50 p-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageDetailModal;
