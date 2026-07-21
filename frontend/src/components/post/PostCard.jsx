import {
  BadgeCheck,
  Heart,
  MessageCircle,
  MoreVertical,
  Share2,
  ShieldAlert,
} from "lucide-react";
import React, { useState } from "react";
import moment from "moment";
// import { dummyUserData } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import UpdatePostModal from "./UpdatePostModal.jsx";
import DeletePostModal from "./DeletePostModal.jsx";
import DetailPostModal from "./DetailPostModal.jsx";
import SharePostModal from "./SharePostModal.jsx";
import ReportPostModal from "./ReportPostModal.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useSocket } from "../../contexts/SocketContext.jsx";
import { toggleLike } from "../../services/PostServices.js";
import toast from "react-hot-toast";

const PostCard = ({ post, onUpdate, onDelete, onToggleLikePost }) => {
  const postWithHashTag = post.content.replace(
    /(#\w+)/g,
    '<span class="text-indigo-600">$1</span>',
  );

  const { userCurrent } = useAuth();
  const [likes, setLikes] = useState(post.likes_count);
  const [open, setOpen] = useState(false);
  // const currentUser = dummyUserData;
  const currentUser = userCurrent;
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { onlineUsers } = useSocket();
  const navigate = useNavigate();
  const isAuthorOnline = onlineUsers.includes(post.user?._id);

  const handleLike = async () => {
    let check = likes.includes(currentUser._id);
    let likeList = likes;

    try {
      if (check) {
        setLikes((prev) => prev.filter((id) => id !== currentUser._id));
      } else {
        setLikes((prev) => [...prev, currentUser._id]);
      }

      const result = await toggleLike(post._id);

      console.log("Result: ", result);

      if (result.success) {
        onToggleLikePost(result.post);
      }
    } catch (error) {
      console.log("Lỗi: ", error);
      toast.error("Bày tỏ cảm xúc bài viết thất bại!", {
        duration: 3000,
      });
      setLikes(likeList);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow p-4 space-y-4 w-full max-w-2xl text-gray-900 dark:text-zinc-100 transition-colors duration-200">
        {/* user info  */}
        <div className="flex justify-between items-center">
          <div
            onClick={() => navigate(`/profile/${post.user._id}`)}
            className="inline-flex items-center gap-3 cursor-pointer "
          >
            <div className="relative">
              <img
                src={
                  post.user?.profile_picture
                    ? post.user?.profile_picture
                    : "/default-avatar.avif"
                }
                alt=""
                className="w-10 h-10 rounded-full shadow object-cover"
              />
              {isAuthorOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span>{post.user.full_name}</span>
                <BadgeCheck className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xs text-gray-500 dark:text-zinc-400">
                @{post.user.username} - {moment(post.createdAt).fromNow()}
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="rounded-full hover:bg-blue-50/50 w-8 h-8 flex justify-center items-center cursor-pointer"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {open && userCurrent._id === post.user._id && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-xl z-50 py-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowUpdateModal(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-900 text-sm font-medium text-gray-700 dark:text-zinc-200 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowDeleteModal(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-900 text-sm font-medium text-red-500 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}

            {open && userCurrent._id !== post.user._id && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-xl z-50 py-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowReportModal(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-900 text-sm font-medium text-gray-700 dark:text-zinc-200 cursor-pointer"
                >
                  Report
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowDeleteModal(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-900 text-sm font-medium text-red-500 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <>
            <div
              className="text-gray-800 dark:text-zinc-200 text-sm whitespace-pre-line break-words"
              dangerouslySetInnerHTML={{ __html: postWithHashTag }}
            ></div>
          </>
        )}

        {/* Image */}
        <div className="grid grid-cols-2 gap-2">
          {post.image_urls &&
            post.image_urls.map((img, index) => (
              <img
                src={img}
                key={index}
                className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto "}`}
              />
            ))}
        </div>

        {/* Shared Post Container */}
        {post.post_type === "share" && post.shared_post && (
          <div
            className="border border-gray-200 dark:border-zinc-800 rounded-xl p-4 bg-gray-50/50 dark:bg-zinc-800/30 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors mt-2 cursor-pointer"
            onClick={() => navigate(`/post/${post.shared_post._id}`)}
          >
            <div className="flex items-center gap-2 mb-2">
              <img
                src={
                  post.shared_post.user?.profile_picture ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
                }
                alt=""
                className="w-7 h-7 rounded-full object-cover"
              />
              <div>
                <span className="font-bold text-xs text-gray-800 dark:text-zinc-200">
                  {post.shared_post.user?.full_name}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 block mt-0.5">
                  {moment(post.shared_post.createdAt).fromNow()}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed break-words">
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
          currentUser?._id === post.user?._id && (
            <div className="bg-amber-50 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30 rounded-2xl p-4 my-2 text-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold select-none">
                <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Comments for this post have been disabled by Admin</span>
              </div>
              <p className="text-amber-700 dark:text-amber-400/80 leading-relaxed font-medium">
                Admin has disabled comments for this post. If you believe this
                is a mistake, you can submit an appeal request.
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
                className="w-fit px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold hover:shadow-xs transition duration-150 cursor-pointer"
              >
                Submit Appeal
              </button>
            </div>
          )}

        {/* Action / Warning for Blocked Post */}
        {post.isActive === false ? (
          currentUser?._id === post.user?._id ? (
            <div className="bg-rose-50 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30 rounded-2xl p-4 my-1 text-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>
                  This post has been blocked due to Community Standards
                  violation
                </span>
              </div>
              <p className="text-rose-600 dark:text-rose-400/80 leading-relaxed font-medium">
                Your post has been temporarily blocked by the moderation team.
                If you believe this is a mistake, you can submit an appeal
                request.
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
                className="w-fit px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold hover:shadow-xs transition duration-150 cursor-pointer"
              >
                Submit Appeal
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 dark:bg-zinc-800/50 dark:border-zinc-800 rounded-2xl p-4 my-1 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <span>
                This content is temporarily unavailable due to Community
                Standards violation.
              </span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-4 text-gray-600 dark:text-zinc-400 text-sm pt-2 border-t border-gray-300 dark:border-zinc-800">
            <div className="flex items-center gap-1">
              <Heart
                className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && "text-red-500 fill-red-500"}`}
                onClick={handleLike}
              />
              <span>{likes.length}</span>
            </div>
            <div
              onClick={() => setShowDetailModal(true)}
              className={`flex items-center gap-1 cursor-pointer transition-colors ${
                post.isCommentDisabled
                  ? "text-amber-500 hover:text-amber-600"
                  : "hover:text-blue-500"
              }`}
              title={
                post.isCommentDisabled
                  ? "Comments disabled by Admin"
                  : "Comments"
              }
            >
              <MessageCircle className="w-4 h-5" />
              <span>{post.comments_count || 0}</span>
              {post.isCommentDisabled && (
                <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 px-1 py-0.5 rounded border border-amber-200 dark:border-amber-900/30">
                  Locked
                </span>
              )}
            </div>
            <div
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors"
            >
              <Share2 className="w-4 h-5" />
              <span>{post.shares_count || 0}</span>
            </div>
          </div>
        )}
      </div>

      {showUpdateModal && (
        <UpdatePostModal
          post={post}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={onUpdate}
        />
      )}

      {showDeleteModal && (
        <DeletePostModal
          post={post}
          onClose={() => setShowDeleteModal(false)}
          onDelete={onDelete}
        />
      )}

      {showDetailModal && (
        <DetailPostModal
          post={post}
          onClose={() => setShowDetailModal(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}

      {showShareModal && (
        <SharePostModal
          post={post}
          onClose={() => setShowShareModal(false)}
          onShare={(updatedPost) => {
            if (onUpdate) onUpdate(updatedPost);
          }}
        />
      )}

      {showReportModal && (
        <ReportPostModal
          postId={post._id}
          onClose={() => setShowReportModal(false)}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

export default PostCard;
