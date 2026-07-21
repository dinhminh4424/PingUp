import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Globe,
  BadgeCheck,
  Trash2,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  X,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";
import moment from "moment";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { getPostById, toggleLike } from "../../services/PostServices";
import {
  getCommentsByPost,
  createComment,
  toggleLikeComment,
  deleteComment,
} from "../../services/CommentServices";
import UpdatePostModal from "../../components/post/UpdatePostModal";
import DeletePostModal from "../../components/post/DeletePostModal";
import SharePostModal from "../../components/post/SharePostModal";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { userCurrent } = useAuth();
  const { onlineUsers } = useSocket();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [replyToComment, setReplyToComment] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [postLikes, setPostLikes] = useState([]);
  const hasLikedPost = postLikes.includes(userCurrent?._id);

  // Fetch Post Details
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const res = await getPostById(postId);
        if (res.success) {
          setPost(res.post);
          setPostLikes(res.post.likes_count || []);
        } else {
          toast.error("Failed to load post");
        }
      } catch (error) {
        console.error("Error loading post detail:", error);
        toast.error("Post not found");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostDetail();
    }
  }, [postId]);

  // Fetch comments for this post
  const fetchComments = async () => {
    if (!post) return;
    try {
      setLoadingComments(true);
      const res = await getCommentsByPost(post._id);
      if (res.success) {
        setComments(res.comments);
      }
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
      toast.error("Error loading comments");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (post?._id) {
      fetchComments();
    }
  }, [post?._id]);

  const handleLikePost = async () => {
    if (!post) return;
    const backupLikes = [...postLikes];
    try {
      if (hasLikedPost) {
        setPostLikes((prev) => prev.filter((id) => id !== userCurrent?._id));
      } else {
        setPostLikes((prev) => [...prev, userCurrent?._id]);
      }

      const res = await toggleLike(post._id);
      if (res.success) {
        setPost(res.post);
        setPostLikes(res.post.likes_count);
      }
    } catch (error) {
      setPostLikes(backupLikes);
      console.error("Error liking post:", error);
      toast.error("Error liking post");
    }
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

  const handleAddComment = async (e, parentCommentId = null) => {
    if (e) e.preventDefault();
    if (!commentInput.trim() && !commentImage) return;

    try {
      setSubmittingComment(true);
      const res = await createComment(
        post._id,
        commentInput,
        parentCommentId,
        commentImage,
      );
      if (res.success) {
        if (parentCommentId) {
          setComments((prev) =>
            insertReplyIntoTree(prev, parentCommentId, res.comment),
          );
          setReplyToComment(null);
        } else {
          setComments((prev) => [...prev, res.comment]);
        }
        setCommentInput("");
        setCommentImage(null);
        setShowEmojiPicker(false);

        // Update comments count on post
        setPost((prev) => ({
          ...prev,
          comments_count: (prev.comments_count || 0) + 1,
        }));

        toast.success(parentCommentId ? "Commented" : "Posted comment");
      }
    } catch (error) {
      console.error("Error commenting:", error);
      toast.error("Failed to comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Helper to update like state recursively in a nested tree
  const updateLikeInTree = (list, commentId, likes, likesCount) => {
    return list.map((item) => {
      if (item._id === commentId) {
        return { ...item, likes, likesCount };
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: updateLikeInTree(item.replies, commentId, likes, likesCount),
        };
      }
      return item;
    });
  };

  const handleLikeComment = async (commentId) => {
    try {
      const res = await toggleLikeComment(commentId);
      if (res.success) {
        setComments((prev) =>
          updateLikeInTree(prev, commentId, res.likes, res.likesCount),
        );
      }
    } catch (error) {
      console.error("Lỗi khi thích bình luận:", error);
    }
  };

  // Helper to delete comment recursively in a nested tree
  const deleteFromTree = (list, commentId) => {
    return list
      .filter((item) => item._id !== commentId)
      .map((item) => {
        if (item.replies && item.replies.length > 0) {
          const isChildDeleted = item.replies.some((r) => r._id === commentId);
          return {
            ...item,
            replies: deleteFromTree(item.replies, commentId),
            replies_count: isChildDeleted
              ? Math.max(0, (item.replies_count || 0) - 1)
              : item.replies_count,
          };
        }
        return item;
      });
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      if (res.success) {
        setComments((prev) => deleteFromTree(prev, commentId));

        // Update comments count on post
        setPost((prev) => ({
          ...prev,
          comments_count: Math.max(0, (prev.comments_count || 0) - 1),
        }));

        toast.success("Delete comment success");
      }
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
      toast.error("Delete comment failed");
    }
  };

  // Render a comment bubble recursively supporting unlimited levels
  const CommentBubble = ({ comment }) => {
    const isCommentLiked = comment.likes?.includes(userCurrent?._id);
    const hasReplies = comment.replies && comment.replies.length > 0;

    const isCommentAuthorOnline = onlineUsers.includes(comment.user?._id);

    if (comment.isActive === false) {
      if (userCurrent?._id === comment.user?._id) {
        return (
          <div className="flex gap-2 items-start py-1">
            <div className="relative shrink-0 w-9 h-9">
              <img
                src={comment.user?.profile_picture || "/default-avatar.avif"}
                alt=""
                className="rounded-full object-cover w-9 h-9 opacity-50 shadow-sm border border-gray-100"
              />
            </div>
            <div className="flex-1">
              <div className="bg-rose-50/70 border border-rose-100/50 rounded-2xl px-4 py-3 max-w-[85%]">
                <span className="font-semibold text-xs text-rose-800 flex items-center gap-1.5 select-none">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  Your comment has been blocked
                </span>
                <p className="text-[11px] text-rose-600/80 mt-1 leading-relaxed">
                  This comment violates Community Standards. You can submit an
                  appeal request.
                </p>
                <button
                  onClick={() => {
                    navigate("/appeal", {
                      state: {
                        targetId: comment._id,
                        targetModel: "Comment",
                        appealType: "Comment Removal Appeal",
                        reason: "Appeal comment block",
                        details: `Appeal comment block for ID: ${comment._id}\nContent: ${comment.content || ""}`,
                      },
                    });
                  }}
                  className="mt-2 text-[11px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  Submit Appeal
                </button>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex gap-2 items-center py-1">
            <div className="text-[11px] italic text-gray-400 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-gray-100 flex items-center gap-1.5 select-none">
              <ShieldAlert className="w-3 h-3 text-gray-300" />
              <span>This comment is unavailable</span>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="flex gap-2 group/item items-start">
        <Link
          to={`/profile/${comment.user?._id}`}
          className="relative shrink-0 w-9 h-9"
        >
          <img
            src={comment.user?.profile_picture || "/default-avatar.avif"}
            alt=""
            className="rounded-full object-cover w-9 h-9 hover:opacity-90 transition-opacity cursor-pointer"
          />
          {isCommentAuthorOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          {/* Bubble wrapper */}
          <div className="flex items-center gap-2">
            <div className="bg-[#f0f2f5] hover:bg-[#e4e6eb] transition-colors rounded-2xl px-3 py-2 inline-block max-w-[85%]">
              <Link
                to={`/profile/${comment.user?._id}`}
                className="font-semibold text-xs text-gray-900 block hover:underline cursor-pointer"
              >
                {comment.user?.full_name}
              </Link>
              <p className="text-sm text-gray-800 break-words font-normal whitespace-pre-wrap mt-0.5">
                {comment.content}
              </p>

              {/* Comment Image display */}
              {comment.image_urls && (
                <div className="mt-2 max-w-[200px] rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <img
                    src={comment.image_urls}
                    alt="Comment attachment"
                    className="w-full h-auto object-cover max-h-[150px] cursor-zoom-in"
                    onClick={() => window.open(comment.image_urls, "_blank")}
                  />
                </div>
              )}
            </div>

            {comment.user?._id === userCurrent?._id && (
              <button
                onClick={() => setCommentToDelete(comment._id)}
                className="opacity-0 group-hover/item:opacity-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-500 hover:text-red-600 transition cursor-pointer"
                title="Delete comment"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 mt-1 pl-2 text-xs text-gray-500 font-semibold">
            <span>{moment(comment.createdAt).fromNow(true)}</span>
            <button
              onClick={() => handleLikeComment(comment._id)}
              className={`hover:underline transition flex items-center gap-0.5 cursor-pointer ${isCommentLiked ? "text-red-500 font-bold" : ""}`}
            >
              Like
            </button>
            <button
              onClick={() => setReplyToComment(comment)}
              className="hover:underline transition cursor-pointer"
            >
              Reply
            </button>

            {comment.likesCount > 0 && (
              <div className="flex items-center gap-0.5 ml-1 bg-white shadow-sm border border-gray-100 rounded-full px-1.5 py-0.5 text-[10px]">
                <span className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0 scale-75">
                  <Heart size={8} fill="white" className="text-white" />
                </span>
                <span className="text-gray-600 font-normal">
                  {comment.likesCount}
                </span>
              </div>
            )}
          </div>

          {/* Replies Section (Recursive render of child comments) */}
          {hasReplies && (
            <div className="mt-3 space-y-3 pl-3 border-l-2 border-indigo-50/50">
              {comment.replies.map((reply) => (
                <CommentBubble key={reply._id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">
          Loading post detail...
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 font-medium">
          Post not found or has been deleted.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer font-semibold shadow-md"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    );
  }

  const hashtags = post.content.replace(
    /(#\w+)/g,
    '<span class="text-indigo-600 hover:underline cursor-pointer">$1</span>',
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back Button and Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-800 transition cursor-pointer"
          title="Go Back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Post Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col overflow-hidden">
        {/* Post Container */}
        <div className="p-5 space-y-4">
          {/* Post Creator Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to={`/profile/${post.user?._id}`}
                className="relative shrink-0"
              >
                <img
                  src={post.user?.profile_picture || "/default-avatar.avif"}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover shadow-sm border border-gray-100 hover:opacity-90 transition-opacity cursor-pointer"
                />
                {onlineUsers.includes(post.user?._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </Link>
              <div>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/profile/${post.user?._id}`}
                    className="font-bold text-gray-900 hover:underline cursor-pointer"
                  >
                    {post.user?.full_name}
                  </Link>
                  {post.user?.is_verified && (
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <span>{moment(post.createdAt).fromNow()}</span>
                  <span>•</span>
                  <Globe size={12} className="text-gray-400" />
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <MoreHorizontal size={18} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border z-20 py-1">
                  {post.user?._id === userCurrent?._id ? (
                    <>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowUpdateModal(true);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowDeleteModal(true);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium text-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        toast.success("Reported");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Post text */}
          {post.content && (
            <div
              className="text-gray-800 text-sm whitespace-pre-wrap font-normal leading-relaxed break-words pt-1"
              dangerouslySetInnerHTML={{ __html: hashtags }}
            />
          )}

          {/* Post media */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="grid grid-cols-1 gap-2 rounded-lg overflow-hidden border border-gray-100">
              {post.image_urls.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  className="w-full h-auto max-h-[600px] object-cover"
                />
              ))}
            </div>
          )}

          {/* Shared Post Container */}
          {post.post_type === "share" && post.shared_post && (
            <div
              className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors mt-2 cursor-pointer"
              onClick={() => {
                navigate(`/post/${post.shared_post._id}`);
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={
                    post.shared_post.user?.profile_picture ||
                    "/default-avatar.avif"
                  }
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <span className="font-bold text-xs text-gray-800">
                    {post.shared_post.user?.full_name}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {moment(post.shared_post.createdAt).fromNow()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed break-words">
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

          {/* Warning for Disabled Comments (If active but comments are disabled for author) */}
          {post.isActive !== false &&
            post.isCommentDisabled === true &&
            userCurrent?._id === post.user?._id && (
              <div className="border-t border-gray-100 p-5 mt-2">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-800 font-bold select-none">
                    <ShieldAlert className="w-5 h-5 text-amber-600 animate-pulse" />
                    <span>
                      Comments for this post have been disabled by Admin
                    </span>
                  </div>
                  <p className="text-amber-700 leading-relaxed font-medium text-xs">
                    Admin has disabled comments for this post. If you believe
                    this is a mistake, you can submit an appeal request.
                  </p>
                  <button
                    onClick={() => {
                      navigate("/appeal", {
                        state: {
                          targetId: post._id,
                          targetModel: "Post",
                          appealType: "Post Removal Appeal",
                          reason: "Appeal to enable comments",
                          details: `Appeal to enable comments for post ID: ${post._id}\nContent: ${post.content || ""}`,
                        },
                      });
                    }}
                    className="w-fit px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold hover:shadow-xs transition duration-150 cursor-pointer"
                  >
                    Submit Appeal
                  </button>
                </div>
              </div>
            )}

          {/* Stats Bar / Actions / Warning for Blocked Post */}
          {post.isActive === false ? (
            <div className="border-t border-gray-100 p-5 mt-2">
              {userCurrent?._id === post.user?._id ? (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-rose-800 font-bold">
                    <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
                    <span>
                      This post has been blocked due to Community Standards
                      violation
                    </span>
                  </div>
                  <p className="text-rose-600 leading-relaxed font-medium text-xs">
                    Your post has been temporarily blocked by the moderation
                    team. If you believe this is a mistake, you can submit an
                    appeal request.
                  </p>
                  <button
                    onClick={() => {
                      navigate("/appeal", {
                        state: {
                          targetId: post._id,
                          targetModel: "Post",
                          appealType: "Post Removal Appeal",
                          reason: "Appeal to unblock post",
                          details: `Appeal post block for ID: ${post._id}\nContent: ${post.content || ""}`,
                        },
                      });
                    }}
                    className="w-fit px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold hover:shadow-xs transition duration-150 cursor-pointer"
                  >
                    Submit Appeal
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
                  <ShieldAlert className="w-8 h-8 text-slate-400" />
                  <span className="font-semibold">
                    This content is temporarily unavailable
                  </span>
                  <span className="text-xs text-gray-500 max-w-md">
                    This post has been blocked due to violation of our Community
                    Standards.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Stats Bar */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-3 pt-2">
                <div className="flex items-center gap-1 select-none">
                  {postLikes.length > 0 && (
                    <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                      <Heart size={10} fill="white" />
                    </span>
                  )}
                  <span className="font-medium text-gray-600">
                    {postLikes.length} Likes
                  </span>
                </div>
                <div className="flex gap-3 select-none font-medium text-gray-600">
                  <span>{post.comments_count || 0} Comments</span>
                  <span>{post.shares_count || 0} Shares</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-1 border-b border-gray-100 py-1 text-sm font-semibold text-gray-600">
                <button
                  onClick={handleLikePost}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${hasLikedPost ? "text-red-500 animate-pulse" : ""}`}
                >
                  <Heart
                    size={18}
                    fill={hasLikedPost ? "currentColor" : "none"}
                    className={hasLikedPost ? "text-red-500" : "text-gray-600"}
                  />
                  <span>Like</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <MessageCircle size={18} />
                  <span>Comment</span>
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>

              {/* Comment section */}
              <div className="space-y-4 pt-3">
                <h3 className="font-bold text-gray-900 text-sm select-none">
                  Comments
                </h3>

                {loadingComments ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                    <span className="w-6 h-6 border-2 border-t-indigo-500 border-gray-200 rounded-full animate-spin" />
                    <span className="text-xs">Loading comments...</span>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">
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
            </>
          )}
        </div>

        {/* Input box footer */}
        {post.isActive !== false && post.isCommentDisabled === true && (
          <div className="border-t border-gray-200 px-5 py-5 bg-gray-50 flex items-center justify-center gap-2 select-none text-xs font-semibold text-muted-foreground rounded-b-2xl">
            <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
            <span>Comments for this post have been disabled by Admin.</span>
          </div>
        )}

        {post.isActive !== false && post.isCommentDisabled !== true && (
          <div className="border-t border-gray-200 px-5 py-4 bg-gray-50/50 relative">
            {/* Active Reply Banner */}
            {replyToComment && (
              <div className="flex items-center justify-between px-3 pb-2 text-xs text-indigo-600 font-semibold select-none animate-fade-in">
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

            {/* Image Selection Preview */}
            {commentImage && (
              <div className="relative inline-block mb-3 ml-11 border border-gray-200 p-1 bg-gray-50 rounded-lg group animate-fade-in">
                <img
                  src={URL.createObjectURL(commentImage)}
                  alt="Selected preview"
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => setCommentImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md cursor-pointer"
                >
                  <X size={10} />
                </button>
              </div>
            )}

            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute bottom-20 right-5 z-20 shadow-2xl rounded-xl overflow-hidden border border-gray-200 animate-fade-in">
                <EmojiPicker
                  onEmojiClick={(emojiData) =>
                    setCommentInput((prev) => prev + emojiData.emoji)
                  }
                  width={320}
                  height={350}
                  searchDisabled={false}
                  skinTonesDisabled={true}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}

            <div className="flex gap-3 items-center">
              <img
                src={
                  userCurrent?.profile_picture
                    ? `${userCurrent.profile_picture}`
                    : "/default-avatar.avif"
                }
                alt=""
                className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 shrink-0"
              />

              <input
                type="file"
                accept="image/*"
                id="comment-image-input-detail"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setCommentImage(e.target.files[0]);
                  }
                }}
              />

              <form
                onSubmit={(e) => handleAddComment(e, replyToComment?._id)}
                className="flex-1 flex bg-white rounded-full px-4 py-2 items-center border border-gray-200 shadow-sm focus-within:border-indigo-405 transition-colors"
              >
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={
                    replyToComment
                      ? `Reply ${replyToComment.user?.full_name}...`
                      : `Comment as ${userCurrent?.full_name || "you"}...`
                  }
                  className="bg-transparent border-none outline-none flex-1 text-sm text-gray-800 placeholder-gray-400"
                />

                <label
                  htmlFor="comment-image-input-detail"
                  className="cursor-pointer text-gray-400 hover:text-indigo-600 p-1.5 rounded-full hover:bg-gray-100 transition shrink-0 mr-1"
                  title="Attach image"
                >
                  <ImageIcon size={18} />
                </label>

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-full hover:bg-gray-100 transition shrink-0 mr-1.5 cursor-pointer"
                  title="Add emoji"
                >
                  <Smile size={18} />
                </button>

                <button
                  type="submit"
                  disabled={
                    (!commentInput.trim() && !commentImage) || submittingComment
                  }
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
                    (commentInput.trim() || commentImage) && !submittingComment
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      : "text-gray-400 bg-transparent"
                  }`}
                >
                  {submittingComment ? (
                    <LoaderCircle
                      size={14}
                      className="animate-spin text-indigo-600"
                    />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {showUpdateModal && (
        <UpdatePostModal
          post={post}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={(updatedPost) => {
            setPost(updatedPost);
          }}
        />
      )}

      {showDeleteModal && (
        <DeletePostModal
          post={post}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            navigate(-1);
          }}
        />
      )}

      {/* Delete Comment Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Comment
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCommentToDelete(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteComment(commentToDelete);
                  setCommentToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showShareModal && (
        <SharePostModal
          post={post}
          onClose={() => setShowShareModal(false)}
          onShare={(updatedPost) => {
            setPost(updatedPost);
          }}
        />
      )}
    </div>
  );
};

export default PostDetail;
