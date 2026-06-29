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
import { useAuth } from "../../contexts/AuthContext.jsx";

const PostCard = ({ post, onUpdate, onDelete }) => {
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

  const navigate = useNavigate();

  const handleLike = () => {};

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
        {/* user info  */}
        <div className="flex justify-between items-center">
          <div
            onClick={() => navigate(`/profile/${post.user._id}`)}
            className="inline-flex items-center gap-3 cursor-pointer "
          >
            <img
              src={post.user?.profile_picture}
              alt=""
              className="w-10 h-10 rounded-full shadow"
            />
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
          {post.image_urls.map((img, index) => (
            <img
              src={img}
              key={index}
              className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto "}`}
            />
          ))}
        </div>

        {/* Action */}
        <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
          <div className="flex items-center gap-1">
            <Heart
              className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && "text-red-500 fill-red-500"}`}
              onClick={handleLike}
            />
            <span>{likes.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-5" />
            <span>{9}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-4 h-5" />
            <span>{10}</span>
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
    </>
  );
};

export default PostCard;
