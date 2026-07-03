import { X, Trash2, LoaderCircle, Smile } from "lucide-react";
import { useState } from "react";
import { updatePost } from "../../services/PostServices";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const UpdatePostModal = ({ post, onClose, onUpdate }) => {
  const [formUpdate, setFormUpdate] = useState({
    content: post.content,
    image_urls_old_remove: [], // Mảng chứa các URL ảnh cũ muốn xóa
    image_urls_new: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleChooseImage = (e) => {
    const files = Array.from(e.target.files);

    setFormUpdate((prev) => ({
      ...prev,
      image_urls_new: [...prev.image_urls_new, ...files],
    }));
  };

  const removeNewImage = (index) => {
    setFormUpdate((prev) => ({
      ...prev,
      image_urls_new: prev.image_urls_new.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitUpdate = async (e) => {
    if (e) {
      e.preventDefault();
    }
    try {
      setLoading(true);
      setError("");
      const data = new FormData();

      data.append("content", formUpdate.content);

      // Gửi danh sách các ảnh cũ cần xoá
      formUpdate.image_urls_old_remove.forEach((url) => {
        data.append("image_urls_old_remove", url);
      });

      formUpdate.image_urls_new.forEach((file) => {
        data.append("image_urls_new", file);
      });

      const res = await updatePost(post._id, data);

      console.log("res.post: ", res.post);

      if (res.success) {
        onUpdate(res.post); // cập nhật ngoài
        toast.success("Cập nhật bài viết thành công!", {
          duration: 3000,
        });
        onClose();
      }
    } catch (error) {
      console.log("Lỗi: ", error);
      toast.error("Cập nhật bài viết thất bại!", {
        duration: 3000,
      });
      setError(
        "Lỗi: " + error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-auto bg-black/50">
      <div className="max-w-2xl sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Update Post</h1>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-red-600">{error}</p>

          {/* Form */}
          <form onSubmit={handleSubmitUpdate} className="space-y-4">
            {/* Content */}
            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-500 hover:text-indigo-600 transition flex items-center gap-1 text-xs font-medium cursor-pointer"
                  title="Thêm biểu cảm"
                >
                  <Smile size={16} />
                  <span>Biểu cảm</span>
                </button>
              </div>
              <textarea
                rows={5}
                value={formUpdate.content}
                onChange={(e) =>
                  setFormUpdate({ ...formUpdate, content: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="What's on your mind?"
              />

              {showEmojiPicker && (
                <div className="absolute right-0 z-50 mt-1 shadow-2xl rounded-xl overflow-hidden border border-gray-150">
                  <EmojiPicker 
                    onEmojiClick={(emojiData) => setFormUpdate(prev => ({ ...prev, content: prev.content + emojiData.emoji }))}
                    width={280}
                    height={300}
                    searchDisabled={false}
                    skinTonesDisabled={true}
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
            </div>

            {/* Các hình ảnh cũ */}
            {post.image_urls && post.image_urls.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Images (Click to delete/restore)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {post.image_urls.map((img, index) => {
                    const isDeleted =
                      formUpdate.image_urls_old_remove.includes(img);
                    return (
                      <div
                        className="group/cover relative cursor-pointer"
                        key={index}
                        onClick={() => {
                          if (isDeleted) {
                            // Hoàn tác xoá: loại khỏi danh sách xoá
                            setFormUpdate((prev) => ({
                              ...prev,
                              image_urls_old_remove:
                                prev.image_urls_old_remove.filter(
                                  (url) => url !== img,
                                ),
                            }));
                          } else {
                            // Đánh dấu xoá: thêm vào danh sách xoá
                            setFormUpdate((prev) => ({
                              ...prev,
                              image_urls_old_remove: [
                                ...prev.image_urls_old_remove,
                                img,
                              ],
                            }));
                          }
                        }}
                      >
                        <img
                          src={img}
                          className={`w-full h-40 rounded-lg object-cover transition-all ${
                            isDeleted
                              ? "border-4 border-red-500 opacity-60 filter grayscale"
                              : "border border-gray-200"
                          }`}
                          alt=""
                        />
                        {isDeleted ? (
                          <div className="absolute inset-0 bg-red-600/30 rounded-lg flex flex-col items-center justify-center gap-1">
                            <Trash2 className="w-8 h-8 text-red-600 bg-white p-1.5 rounded-full shadow" />
                            <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded shadow animate-pulse">
                              Click to Restore
                            </span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 hidden group-hover/cover:flex bg-black/30 rounded-lg items-center justify-center">
                            <Trash2 className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Các hình ảnh mới */}
            <div className="flex flex-col items-start gap-3">
              <label
                htmlFor="cover_photo"
                className="block text-sm font-medium text-gray-700 w-full"
              >
                Upload New Images
                <input
                  hidden
                  type="file"
                  id="cover_photo"
                  multiple
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  onChange={handleChooseImage}
                />
                <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition mt-2">
                  <span className="text-gray-500 font-medium text-sm">
                    + Add Images
                  </span>
                </div>
              </label>

              {formUpdate.image_urls_new.length > 0 && (
                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                  {formUpdate.image_urls_new.map((file, index) => (
                    <div
                      key={index}
                      className="group/cover relative cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeNewImage(index);
                      }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-40 rounded-lg object-cover border border-gray-200"
                        alt=""
                      />
                      <div className="absolute inset-0 hidden group-hover/cover:flex bg-black/40 rounded-lg items-center justify-center">
                        <X className="w-6 h-6 text-white bg-red-500 p-1 rounded-full shadow" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button
                onClick={onClose}
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <p>Update</p>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePostModal;
