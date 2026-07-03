import React, { useState } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import { deletePost } from "../../services/PostServices";
import toast from "react-hot-toast";

const DeletePostModal = ({ post, onClose, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await deletePost(post._id);
      if (res.success) {
        toast.success("Deleted post success!", {
          duration: 3000,
        });
        onDelete(post._id); // cập nhật ở ngoài
        onClose();
      } else {
        setError(res.message || "Xóa bài viết thất bại!");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Error deleting post"
      );
      toast.error("Delete post failed!", {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold text-gray-900 font-semibold">Delete Post</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Are you sure you want to delete this post? This action cannot be undone and this post will be permanently removed from your feed.
          </p>
          {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 bg-white font-medium text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePostModal;
