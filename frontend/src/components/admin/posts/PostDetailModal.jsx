import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Globe,
  BadgeCheck,
  Ban,
  Check,
  RotateCcw,
  Trash2,
  Smile,
  Image as ImageIcon,
  CornerDownRight,
} from "lucide-react";
import moment from "moment";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getCommentsByPost,
  createComment,
  deleteComment,
} from "@/services/CommentServices";
import toast from "react-hot-toast";

const PostDetailModal = ({
  post: initialPost,
  onClose,
  onToggleActive,
  onToggleDelete,
  formatDate,
  onCommentAdded,
}) => {
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [replyToComment, setReplyToComment] = useState(null);
  const commentInputRef = useRef(null);

  // Fetch comments tree on mount
  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await getCommentsByPost(post._id);
      if (res.success) {
        setComments(res.comments);
      }
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post._id]);

  const getInitials = (name) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to insert reply recursively in a nested tree
  const insertReplyIntoTree = (list, parentId, newReply) => {
    return list.map((item) => {
      if (item._id === parentId) {
        return {
          ...item,
          replies: [...(item.replies || []), newReply],
          replies_count: (item.replies_count || 0) + 1,
        };
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: insertReplyIntoTree(item.replies, parentId, newReply),
        };
      }
      return item;
    });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      const res = await createComment(
        post._id,
        commentInput,
        replyToComment ? replyToComment._id : null,
      );
      if (res.success) {
        if (replyToComment) {
          setComments((prev) =>
            insertReplyIntoTree(prev, replyToComment._id, res.comment),
          );
          setReplyToComment(null);
        } else {
          setComments((prev) => [...prev, res.comment]);
        }
        setCommentInput("");

        // Cập nhật số đếm bình luận ở Post
        const updatedPost = {
          ...post,
          comments_count: (post.comments_count || 0) + 1,
        };
        setPost(updatedPost);

        if (onCommentAdded) {
          onCommentAdded(post._id, res.comment);
        }
        toast.success("Bình luận thành công");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi hệ thống khi gửi bình luận!",
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      const res = await deleteComment(commentId);
      if (res.success) {
        toast.success("Xóa bình luận thành công");
        fetchComments();

        const updatedPost = {
          ...post,
          comments_count: Math.max(0, (post.comments_count || 0) - 1),
        };
        setPost(updatedPost);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa bình luận");
    }
  };

  // Render a comment bubble recursively supporting nested replies
  const CommentBubble = ({ comment }) => {
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <div className="flex gap-2.5 group/item items-start">
        <Avatar className="w-8 h-8 shrink-0 border">
          <AvatarImage src={comment.user?.profile_picture} />
          <AvatarFallback className="text-[10px] font-bold">
            {getInitials(comment.user?.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="bg-[#f0f2f5] hover:bg-[#e4e6eb] dark:bg-zinc-900/60 dark:hover:bg-zinc-800 transition-colors rounded-2xl px-3 py-2 inline-block max-w-[85%]">
              <span className="font-semibold text-xs text-gray-900 dark:text-gray-100 block">
                {comment.user?.full_name}
              </span>
              <p className="text-sm text-gray-800 dark:text-gray-200 break-words font-normal whitespace-pre-wrap mt-0.5">
                {comment.content}
              </p>

              {comment.image_urls && (
                <div className="mt-2 max-w-[200px] rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800 bg-white">
                  <img
                    src={comment.image_urls}
                    alt="Comment attachment"
                    className="w-full h-auto object-cover max-h-[150px] cursor-pointer"
                    onClick={() => window.open(comment.image_urls, "_blank")}
                  />
                </div>
              )}
            </div>

            {/* Admin can delete any comment */}
            <button
              onClick={() => handleDeleteComment(comment._id)}
              className="opacity-0 group-hover/item:opacity-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-500 hover:text-red-600 transition cursor-pointer"
              title="Delete comment"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 mt-1 pl-2 text-[10px] text-gray-500 font-semibold">
            <span>{moment(comment.createdAt).fromNow(true)}</span>
            <button
              onClick={() => {
                setReplyToComment(comment);
                commentInputRef.current?.focus();
              }}
              className="hover:underline transition cursor-pointer"
            >
              Reply
            </button>
          </div>

          {/* Replies Section (Recursive render of child comments) */}
          {hasReplies && (
            <div className="mt-3 space-y-3 pl-3 border-l-2 border-indigo-100/50">
              {comment.replies.map((reply) => (
                <CommentBubble key={reply._id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 select-none">
            Post of {post.user?.full_name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* ADMIN ACTION PANEL - HIGHLIGHTED BANNER */}
          <div className="bg-indigo-50/70 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Bảng điều khiển Admin
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                Báo cáo:{" "}
                <span className="text-amber-600 font-bold">
                  {post.reports_count || 0} lượt
                </span>{" "}
                | Trạng thái:{" "}
                <span
                  className={`font-semibold ${post.isDelete ? "text-rose-500" : post.isActive ? "text-emerald-600" : "text-amber-500"}`}
                >
                  {post.isDelete
                    ? "Đã xóa"
                    : post.isActive
                      ? "Đang hoạt động"
                      : "Đang bị khóa"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!post.isDelete && (
                <Button
                  variant={post.isActive ? "outline" : "destructive"}
                  size="sm"
                  onClick={() => onToggleActive(post._id)}
                  className="h-8 text-xs font-semibold"
                >
                  {post.isActive ? (
                    <>
                      <Ban className="size-3 mr-1" />
                      Khóa
                    </>
                  ) : (
                    <>
                      <Check className="size-3 mr-1" />
                      Mở khóa
                    </>
                  )}
                </Button>
              )}
              <Button
                variant={post.isDelete ? "default" : "destructive"}
                size="sm"
                onClick={() => onToggleDelete(post._id)}
                className="h-8 text-xs font-semibold"
              >
                {post.isDelete ? (
                  <>
                    <RotateCcw className="size-3 mr-1" />
                    Khôi phục
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3 mr-1" />
                    Xóa bài
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={post.user?.profile_picture} />
                  <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">
                    {getInitials(post.user?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 hover:underline">
                    {post.user?.full_name}
                  </span>
                  {post.user?.is_verified && (
                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>{moment(post.createdAt).fromNow()}</span>
                  <span>•</span>
                  <Globe size={12} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Post Text */}
          {post.content && (
            <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap font-normal leading-relaxed break-words">
              {post.content}
            </p>
          )}

          {/* Post Images */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="grid grid-cols-1 gap-2 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-800">
              {post.image_urls.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="Post Attachment"
                  className="w-full h-auto object-cover"
                />
              ))}
            </div>
          )}

          {/* Shared Post Container */}
          {post.post_type === "share" && post.shared_post && (
            <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={post.shared_post.user?.profile_picture} />
                  <AvatarFallback>
                    {getInitials(post.shared_post.user?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-bold text-xs text-gray-800 dark:text-gray-200">
                    {post.shared_post.user?.full_name}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {moment(post.shared_post.createdAt).fromNow()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {post.shared_post.content}
              </p>
              {post.shared_post.image_urls &&
                post.shared_post.image_urls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {post.shared_post.image_urls.map((img, index) => (
                      <img
                        src={img}
                        key={index}
                        className={`w-full h-32 object-cover rounded-lg ${post.shared_post.image_urls.length === 1 && "col-span-2 h-auto max-h-64"}`}
                      />
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Post Information Details Block */}
          <div className="bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl p-3.5 border border-gray-100 dark:border-zinc-900/80 space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[10px] border-b pb-1 border-gray-200 dark:border-zinc-800">
              Thông tin chi tiết
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <span className="font-medium text-gray-400">
                  Email người đăng:
                </span>{" "}
                <span className="text-gray-800 dark:text-gray-200 font-semibold">
                  {post.user?.email || "Chưa cập nhật"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-400">
                  Loại bài đăng:
                </span>{" "}
                <span className="text-gray-800 dark:text-gray-200 font-semibold uppercase">
                  {post.post_type || "text"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-400">Ngày đăng:</span>{" "}
                <span className="text-gray-800 dark:text-gray-200 font-semibold">
                  {moment(post.createdAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-400">
                  Cập nhật cuối:
                </span>{" "}
                <span className="text-gray-800 dark:text-gray-200 font-semibold">
                  {moment(post.updatedAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
            </div>
          </div>

          {/* Reports List */}
          {post.reports && post.reports.length > 0 && (
            <div className="bg-amber-500/5 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/50 rounded-xl p-3.5 space-y-2.5">
              <h3 className="font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-b pb-1 border-amber-200 dark:border-amber-900">
                <span className="size-2 bg-amber-500 rounded-full animate-pulse" />
                <span>Chi tiết báo cáo vi phạm ({post.reports.length})</span>
              </h3>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {post.reports.map((report) => (
                  <div
                    key={report._id}
                    className="bg-white dark:bg-zinc-900/40 border border-amber-100 dark:border-zinc-800/40 p-2.5 rounded-lg text-xs space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="size-5 border">
                          <AvatarImage
                            src={report.reporterId?.profile_picture}
                          />
                          <AvatarFallback className="text-[8px]">
                            {getInitials(report.reporterId?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {report.reporterId?.full_name ||
                            `@${report.reporterId?.username}`}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {moment(report.createdAt).fromNow()}
                      </span>
                    </div>
                    <div className="bg-amber-500/5 dark:bg-zinc-900 px-2 py-1 rounded border border-amber-100/50 dark:border-zinc-800">
                      <span className="font-semibold text-amber-800 dark:text-amber-400">
                        Lý do:
                      </span>{" "}
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {report.reason}
                      </span>
                      {report.details && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 border-t border-dashed pt-1 border-gray-200 dark:border-zinc-800">
                          {report.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Metrics Info Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-200 dark:border-zinc-800 pb-3 pt-1">
            <div className="flex items-center gap-1 select-none">
              {(post.likes_count?.length > 0 || post.likesCountValue > 0) && (
                <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                  <Heart size={10} fill="white" />
                </span>
              )}
              <span>
                {post.likesCountValue || post.likes_count?.length || 0} Likes
              </span>
            </div>
            <div className="flex gap-3 select-none font-medium">
              <span>{post.comments_count || 0} Comments</span>
              <span>{post.shares_count || 0} Shares</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-1 border-b border-gray-200 dark:border-zinc-800 py-1 text-sm font-semibold text-gray-600 dark:text-gray-400 select-none">
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
              <Heart size={18} />
              <span>Like</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
              <MessageCircle size={18} />
              <span>Comment</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>

          {/* Comments List Section */}
          <div className="space-y-4 pt-2">
            {loadingComments ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400 gap-2">
                <span className="w-6 h-6 border-2 border-t-indigo-500 border-gray-200 rounded-full animate-spin" />
                <span className="text-xs">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-505 text-sm italic">
                Be the first to comment on this post!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentBubble key={comment._id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Input Footer */}
        <div className="border-t border-gray-200 dark:border-zinc-800 px-4 py-3 bg-white dark:bg-zinc-900 shrink-0 relative">
          {/* Active Reply Banner */}
          {replyToComment && (
            <div className="flex items-center justify-between px-3 pb-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold select-none animate-fade-in">
              <span>Replying to {replyToComment.user?.full_name}</span>
              <button
                type="button"
                onClick={() => setReplyToComment(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            {/* Input form */}
            <form
              onSubmit={handleAddComment}
              className="flex-1 flex bg-[#f0f2f5] dark:bg-zinc-900 rounded-full px-4 py-2 items-center border border-gray-100 dark:border-zinc-800"
            >
              <input
                ref={commentInputRef}
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={
                  replyToComment
                    ? `Reply ${replyToComment.user?.full_name}...`
                    : "Comment..."
                }
                className="bg-transparent border-none outline-none flex-1 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500"
              />

              <button
                type="button"
                className="text-gray-500 hover:text-indigo-600 p-1 rounded-full transition shrink-0 mr-1 cursor-pointer"
              >
                <ImageIcon size={18} />
              </button>

              <button
                type="button"
                className="text-gray-500 hover:text-indigo-600 p-1 rounded-full transition shrink-0 mr-1.5 cursor-pointer"
              >
                <Smile size={18} />
              </button>

              <button
                type="submit"
                disabled={!commentInput.trim()}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
                  commentInput.trim()
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                    : "text-gray-400 bg-transparent"
                }`}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
