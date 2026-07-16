import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { reportPost } from "../../services/PostServices";
import { LoaderCircle, X, ShieldAlert, Image, Trash2, Plus } from "lucide-react";

const ReportPostModal = ({ postId, onClose, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formReport, setFormReport] = useState({
    targetType: "post",
    reason: "",
  });

  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const reportReasons = [
    "Vấn đề liên quan đến người dưới 18 tuổi",
    "Bắt nạt, quấy rối hoặc lăng mạ/lạm dụng/ngược đãi",
    "Tự tử hoặc tự hại bản thân",
    "Nội dung mang tính bạo lực, thù ghét hoặc gây phiền toái",
    "Bán hoặc quảng bá mặt hàng bị hạn chế",
    "Nội dung người lớn",
    "Thông tin sai sự thật, lừa đảo hoặc gian lận",
    "Quyền sở hữu trí tuệ",
    "Tôi không muốn xem nội dung này",
  ];

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!formReport.reason) {
      toast.error("Vui lòng chọn lý do báo cáo!");
      return;
    }
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("targetType", formReport.targetType);
      formData.append("reason", formReport.reason);
      
      if (showDetails) {
        if (details.trim()) {
          formData.append("details", details);
        }
        selectedImages.forEach((image) => {
          formData.append("images", image);
        });
      }

      const res = await reportPost(postId, formData);

      console.log("res.reportPost: ", res.reportPost);

      if (res.success) {
        onDelete(postId); // cập nhật ngoài
        toast.success("Báo cáo bài viết thành công!", {
          duration: 3000,
        });
        onClose();
      }
    } catch (error) {
      console.log("Lỗi: ", error);
      toast.error("Báo cáo bài viết thất bại!", {
        duration: 3000,
      });
      setError("Lỗi: " + (error.response?.data?.message || "Báo cáo thất bại."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="max-w-md w-full transform transition-all my-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
            <div className="flex items-center gap-2.5 text-amber-600">
              <ShieldAlert className="w-5.5 h-5.5" />
              <h2 className="text-lg font-semibold text-gray-900">Báo cáo bài viết / Report Post</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-200/70 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content (Scrollable if too long) */}
          <div className="overflow-y-auto p-6 flex-grow">
            <form onSubmit={handleSubmitReport} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Content */}
              <div className="space-y-2">
                <label htmlFor="report-reason" className="block text-sm font-medium text-gray-700">
                  Lý do báo cáo
                </label>

                <select
                  id="report-reason"
                  value={formReport.reason}
                  onChange={(e) => {
                    setFormReport({ ...formReport, reason: e.target.value });
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                >
                  <option value="">-- Chọn lý do báo cáo --</option>
                  {reportReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Details Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
                >
                  {showDetails ? (
                    <>Ẩn chi tiết & ảnh bằng chứng</>
                  ) : (
                    <>+ Thêm mô tả chi tiết & ảnh minh họa (Tùy chọn)</>
                  )}
                </button>
              </div>

              {/* Detailed Area (collapsible) */}
              {showDetails && (
                <div className="space-y-4 pt-2 border-t border-dashed border-gray-200">
                  <div className="space-y-2">
                    <label htmlFor="report-details" className="block text-xs font-medium text-gray-600">
                      Mô tả chi tiết bằng chứng vi phạm
                    </label>
                    <textarea
                      id="report-details"
                      rows={3}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Cung cấp thêm chi tiết hoặc ngữ cảnh cụ thể..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">
                      Hình ảnh bằng chứng (Tùy chọn)
                    </label>

                    {/* Previews grid */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-90 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Image Button */}
                    <label className="flex items-center justify-center border border-dashed border-gray-300 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Image size={16} className="text-gray-400" />
                        <span>Chọn ảnh minh họa</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 leading-relaxed pt-1">
                Nếu bạn nhận thấy ai đó đang gặp nguy hiểm, đừng chờ đợi. Hãy báo cáo ngay cho cơ quan chức năng hoặc dịch vụ khẩn cấp tại địa phương.
              </p>

              {/* Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6 flex-shrink-0">
                <button
                  onClick={onClose}
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
                >
                  Hủy / Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || !formReport.reason}
                  className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <span>Gửi báo cáo / Report</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPostModal;

