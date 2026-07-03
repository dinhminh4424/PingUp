import React, { useState, useEffect } from "react";
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  Globe, 
  BadgeCheck, 
  Trash2,
  MoreHorizontal,
  Image as ImageIcon,
  Smile
} from "lucide-react";
import moment from "moment";
import { useAuth } from "../../contexts/AuthContext";
import { toggleLike } from "../../services/PostServices";
import { 
  getCommentsByPost, 
  createComment, 
  toggleLikeComment, 
  deleteComment 
} from "../../services/CommentServices";
import UpdatePostModal from "./UpdatePostModal";
import DeletePostModal from "./DeletePostModal";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const DetailPostModal = ({ post: initialPost, onClose, onUpdate, onDelete }) => {
  const { userCurrent } = useAuth();
  const [post, setPost] = useState(initialPost);
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

  const [postLikes, setPostLikes] = useState(post.likes_count || []);
  const hasLikedPost = postLikes.includes(userCurrent?._id);

  // Fetch comments for this post
  const fetchComments = async () => {
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
    fetchComments();
  }, [post._id]);

  const handleLikePost = async () => {
    const backupLikes = [...postLikes];
    try {
      if (hasLikedPost) {
        setPostLikes(prev => prev.filter(id => id !== userCurrent?._id));
      } else {
        setPostLikes(prev => [...prev, userCurrent?._id]);
      }

      const res = await toggleLike(post._id);
      if (res.success) {
        setPost(res.post);
        setPostLikes(res.post.likes_count);
        if (onUpdate) onUpdate(res.post);
      }
    } catch (error) {
      setPostLikes(backupLikes);
      console.error("Error liking post:", error);
      toast.error("Error liking post");
    }
  };

  // Helper to insert reply recursively in a nested tree
  const insertReplyIntoTree = (list, parentId, newReply) => {
    return list.map(item => {
      if (item._id === parentId) {
        return {
          ...item,
          replies: [...(item.replies || []), newReply],
          replies_count: (item.replies_count || 0) + 1
        };
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: insertReplyIntoTree(item.replies, parentId, newReply)
        };
      }
      return item;
    });
  };

  const handleAddComment = async (e, parentCommentId = null) => {
    if (e) e.preventDefault();
    if (!commentInput.trim() && !commentImage) return;

    try {
      const res = await createComment(post._id, commentInput, parentCommentId, commentImage);
      if (res.success) {
        if (parentCommentId) {
          setComments(prev => insertReplyIntoTree(prev, parentCommentId, res.comment));
          setReplyToComment(null);
        } else {
          setComments(prev => [...prev, res.comment]);
        }
        setCommentInput("");
        setCommentImage(null);
        setShowEmojiPicker(false);
        
        // Update comments count on post
        const updatedPost = {
          ...post,
          comments_count: (post.comments_count || 0) + 1
        };
        setPost(updatedPost);
        if (onUpdate) onUpdate(updatedPost);
        
        toast.success(parentCommentId ? "Commented" : "Posted comment");
      }
    } catch (error) {
      console.error("Error commenting:", error);
      toast.error("Failed to comment");
    }
  };

  // Helper to update like state recursively in a nested tree
  const updateLikeInTree = (list, commentId, likes, likesCount) => {
    return list.map(item => {
      if (item._id === commentId) {
        return { ...item, likes, likesCount };
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: updateLikeInTree(item.replies, commentId, likes, likesCount)
        };
      }
      return item;
    });
  };

  const handleLikeComment = async (commentId) => {
    try {
      const res = await toggleLikeComment(commentId);
      if (res.success) {
        setComments(prev => updateLikeInTree(prev, commentId, res.likes, res.likesCount));
      }
    } catch (error) {
      console.error("Lỗi khi thích bình luận:", error);
    }
  };

  // Helper to delete comment recursively in a nested tree
  const deleteFromTree = (list, commentId) => {
    return list.filter(item => item._id !== commentId).map(item => {
      if (item.replies && item.replies.length > 0) {
        const isChildDeleted = item.replies.some(r => r._id === commentId);
        return {
          ...item,
          replies: deleteFromTree(item.replies, commentId),
          replies_count: isChildDeleted ? Math.max(0, (item.replies_count || 0) - 1) : item.replies_count
        };
      }
      return item;
    });
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      if (res.success) {
        setComments(prev => deleteFromTree(prev, commentId));

        // Update comments count on post
        const updatedPost = {
          ...post,
          comments_count: Math.max(0, (post.comments_count || 0) - 1)
        };
        setPost(updatedPost);
        if (onUpdate) onUpdate(updatedPost);

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

    return (
      <div className="flex gap-2 group/item">
        <img
          src={comment.user?.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
          alt=""
          className="rounded-full object-cover shrink-0 w-9 h-9"
        />
        
        <div className="flex-1 min-w-0">
          {/* Bubble wrapper */}
          <div className="flex items-center gap-2">
            <div className="bg-[#f0f2f5] hover:bg-[#e4e6eb] transition-colors rounded-2xl px-3 py-2 inline-block max-w-[85%]">
              <span className="font-semibold text-xs text-gray-900 block hover:underline cursor-pointer">
                {comment.user?.full_name}
              </span>
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
                className="opacity-0 group-hover/item:opacity-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-150 text-gray-500 hover:text-red-600 transition cursor-pointer"
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
              Thích
            </button>
            <button 
              onClick={() => setReplyToComment(comment)}
              className="hover:underline transition cursor-pointer"
            >
              Trả lời
            </button>
            
            {comment.likesCount > 0 && (
              <div className="flex items-center gap-0.5 ml-1 bg-white shadow-sm border border-gray-100 rounded-full px-1.5 py-0.5 text-[10px]">
                <span className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0 scale-75">
                  <Heart size={8} fill="white" className="text-white" />
                </span>
                <span className="text-gray-600 font-normal">{comment.likesCount}</span>
              </div>
            )}
          </div>

          {/* Replies Section (Recursive render of child comments) */}
          {hasReplies && (
            <div className="mt-3 space-y-3 pl-3 border-l-2 border-indigo-50/50">
              {comment.replies.map(reply => (
                <CommentBubble 
                  key={reply._id} 
                  comment={reply} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const hashtags = post.content.replace(
    /(#\w+)/g,
    '<span class="text-indigo-600 hover:underline cursor-pointer">$1</span>'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 shrink-0">
          <div className="w-8"></div>
          <h2 className="text-lg font-bold text-gray-900 select-none">
            Post of {post.user?.full_name}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={post.user?.profile_picture} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-900 hover:underline cursor-pointer">
                    {post.user?.full_name}
                  </span>
                  {post.user?.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
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
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border z-50 py-1">
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

          {/* Post Text */}
          {post.content && (
            <div 
              className="text-gray-800 text-sm whitespace-pre-wrap font-normal leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: hashtags }}
            />
          )}

          {/* Post Images */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="grid grid-cols-1 gap-2 rounded-lg overflow-hidden border border-gray-150">
              {post.image_urls.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  alt="" 
                  className="w-full h-auto max-h-[500px] object-cover" 
                />
              ))}
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-200 pb-3 pt-1">
            <div className="flex items-center gap-1 select-none">
              {postLikes.length > 0 && (
                <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                  <Heart size={10} fill="white" />
                </span>
              )}
              <span>{postLikes.length} Likes</span>
            </div>
            <div className="flex gap-3 select-none">
              <span>{post.comments_count || 0} Comments</span>
              <span>12 Shares</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-1 border-b border-gray-200 py-1 text-sm font-semibold text-gray-600">
            <button 
              onClick={handleLikePost}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${hasLikedPost ? "text-red-500 animate-pulse" : ""}`}
            >
              <Heart size={18} fill={hasLikedPost ? "currentColor" : "none"} className={hasLikedPost ? "text-red-500" : "text-gray-600"} />
              <span>Like</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <MessageCircle size={18} />
              <span>Comment</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
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
              <div className="text-center py-8 text-gray-500 text-sm">
                Be the first to comment on this post!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <CommentBubble key={comment._id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Input Footer */}
        <div className="border-t border-gray-200 px-4 py-3 bg-white shrink-0 relative">
          {/* Active Reply Banner */}
          {replyToComment && (
            <div className="flex items-center justify-between px-3 pb-2 text-xs text-indigo-600 font-semibold select-none animate-fade-in">
              <span>Đang trả lời {replyToComment.user?.full_name}</span>
              <button 
                type="button" 
                onClick={() => setReplyToComment(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                Hủy
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
            <div className="absolute bottom-16 right-4 z-50 shadow-2xl rounded-xl overflow-hidden border border-gray-200 animate-fade-in">
              <EmojiPicker 
                onEmojiClick={(emojiData) => setCommentInput(prev => prev + emojiData.emoji)}
                width={320}
                height={350}
                searchDisabled={false}
                skinTonesDisabled={true}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}

          <div className="flex gap-2 items-center">
            <img 
              src={userCurrent?.profile_picture} 
              alt="" 
              className="w-9 h-9 rounded-full object-cover shadow-sm shrink-0"
            />
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              id="comment-image-input" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setCommentImage(e.target.files[0]);
                }
              }}
            />

            <form 
              onSubmit={(e) => handleAddComment(e, replyToComment?._id)}
              className="flex-1 flex bg-[#f0f2f5] rounded-full px-4 py-2 items-center border border-gray-150"
            >
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={replyToComment ? `Reply ${replyToComment.user?.full_name}...` : `Comment as ${userCurrent?.full_name || "you"}...`}
                className="bg-transparent border-none outline-none flex-1 text-sm text-gray-800 placeholder-gray-500"
              />
              
              {/* Upload Image Button */}
              <label 
                htmlFor="comment-image-input" 
                className="cursor-pointer text-gray-500 hover:text-indigo-600 p-1.5 rounded-full hover:bg-gray-200 transition shrink-0 mr-1"
                title="Attach image"
              >
                <ImageIcon size={18} />
              </label>

              {/* Emoji Picker Trigger */}
              <button 
                type="button" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-500 hover:text-indigo-600 p-1.5 rounded-full hover:bg-gray-200 transition shrink-0 mr-1.5 cursor-pointer"
                title="Add emoji"
              >
                <Smile size={18} />
              </button>

              <button 
                type="submit" 
                disabled={!commentInput.trim() && !commentImage}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${commentInput.trim() || commentImage ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" : "text-gray-400 bg-transparent"}`}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>

      </div>

      {showUpdateModal && (
        <UpdatePostModal
          post={post}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={(updatedPost) => {
            setPost(updatedPost);
            if (onUpdate) onUpdate(updatedPost);
          }}
        />
      )}

      {showDeleteModal && (
        <DeletePostModal
          post={post}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            onClose();
            if (onDelete) onDelete(post._id);
          }}
        />
      )}

      {/* Styled Delete Comment Confirmation Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Comment</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
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
    </div>
  );
};

export default DetailPostModal;
