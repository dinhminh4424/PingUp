import {
  BadgeCheck,
  Heart,
  MessageCircle,
  MoreVertical,
  Share2,
} from "lucide-react";
import React, { useState } from "react";
import moment from "moment";
// import { dummyUserData } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import UpdatePostModal from "./UpdatePostModal.jsx";
import DeletePostModal from "./DeletePostModal.jsx";
import DetailPostModal from "./DetailPostModal.jsx";
import SharePostModal from "./SharePostModal.jsx";
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
      <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
        {/* user info  */}
        <div className="flex justify-between items-center">
          <div
            onClick={() => navigate(`/profile/${post.user._id}`)}
            className="inline-flex items-center gap-3 cursor-pointer "
          >
            <div className="relative">
              <img
                src={post.user?.profile_picture}
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
              <div className="">
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
              <div className="absolute right-0 top-full mt-2 w-40 bg-white  rounded-lg shadow-lg border shadow-xl z-50">
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowUpdateModal(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowDeleteModal(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                >
                  Delete
                </button>
              </div>
            )}

            {open && userCurrent._id !== post.user._id && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white  rounded-lg shadow-lg border shadow-xl z-50">
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowUpdateModal(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Report
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowDeleteModal(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
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
              className="text-gray-800 text-sm whitespace-pre-line "
              dangerouslySetInnerHTML={{ __html: postWithHashTag }}
            ></div>
          </>
        )}

        {/* Image */}
        <div className="grid grid-cols-2 gap-2">
          {post.image_urls && post.image_urls.map((img, index) => (
            <img
              src={img}
              key={index}
              className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto "}`}
            />
          ))}
        </div>

        {/* Shared Post Container */}
        {post.post_type === "share" && post.shared_post && (
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors mt-2 cursor-pointer" onClick={() => navigate(`/post/${post.shared_post._id}`)}>
            <div className="flex items-center gap-2 mb-2">
              <img 
                src={post.shared_post.user?.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
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
            <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
              {post.shared_post.content}
            </p>
            {post.shared_post.image_urls && post.shared_post.image_urls.length > 0 && (
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

        {/* Action */}
        <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
          <div className="flex items-center gap-1">
            <Heart
              className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && "text-red-500 fill-red-500"}`}
              onClick={handleLike}
            />
            <span>{likes.length}</span>
          </div>
          <div 
            onClick={() => setShowDetailModal(true)}
            className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-4 h-5" />
            <span>{post.comments_count || 0}</span>
          </div>
          <div 
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors"
          >
            <Share2 className="w-4 h-5" />
            <span>{post.shares_count || 0}</span>
          </div>
        </div>
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
    </>
  );
};

export default PostCard;
