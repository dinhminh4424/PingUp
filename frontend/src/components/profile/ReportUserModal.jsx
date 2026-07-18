import { BadgeCheck,
  X,
  Trash2,
  Image,
  LoaderCircle,} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createReportUser } from "../../services/UserServices";

const ReportUserModal = ({ user, onClose }) => {
  const [reportForm, setReportForm] = useState({
    targetType: "user",
    reason: "",
    details: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showDetails, setShowDetails] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const reportReasons = [
    "Issues involving minors",
    "Bullying, harassment, or abuse",
    "Suicide or self-harm",
    "Violent, hateful, or offensive content",
    "Sale or promotion of restricted items",
    "Adult content",
    "Misinformation, scams, or fraud",
    "Intellectual property rights",
    "I do not want to see this content",
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

  const handleSubmit = async () => {
    if (!reportForm.reason) {
      toast.error("Please select a reason for reporting !");
      return;
    }
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("targetType", reportForm.targetType);
      formData.append("reason", reportForm.reason);
      formData.append("details", reportForm.details);

      if (showDetails) {
        selectedImages.forEach((image) => {
          formData.append("images", image);
        });
      }

      const res = await createReportUser(user._id, formData);

      console.log("res.reportUser: ", res.reportPost);

      if (res.success) {
        toast.success("Report post successfully!", {
          duration: 3000,
        });
        onClose();
      }
    } catch (error) {
      console.log("Error: ", error);
      toast.error("Report post failed!", {
        duration: 3000,
      });
      setError(
        "Error: " + (error.response?.data?.message || "Report post failed."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-zinc-800 max-w-md w-[95vw] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Report User</h3>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
              #{user._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="p-5 overflow-y-auto flex flex-col gap-4 text-xs scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* user info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800/80">
            <img
              src={user?.profile_picture || "/default-avatar.avif"}
              alt=""
              className="w-10 h-10 rounded-full shadow-sm object-cover border border-white dark:border-zinc-700"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{user.full_name}</span>
                <BadgeCheck className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-[10px] text-gray-500 dark:text-zinc-400">
                @{user.username}
              </div>
            </div>
          </div>

          {/* Form Content (Scrollable if too long) */}
          <div className="space-y-4 flex-grow scrollbar-hide">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-lg text-xs font-semibold border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            {/* Content */}
            <div className="space-y-1.5">
              <label
                htmlFor="report-reason"
                className="block text-xs font-semibold text-slate-500"
              >
                Reason for reporting
              </label>

              <select
                id="report-reason"
                value={reportForm.reason}
                onChange={(e) => {
                  setReportForm({ ...reportForm, reason: e.target.value });
                }}
                className="w-full text-xs p-2 bg-slate-50 border border-gray-250 rounded-md outline-none focus:bg-white focus:border-indigo-300 transition dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
              >
                <option value="">-- Select a reason for reporting --</option>
                {reportReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Details Button */}
            <div>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:underline transition cursor-pointer"
              >
                {showDetails ? (
                  <>Hide details & evidence images</>
                ) : (
                  <>+ Add detailed description & evidence images (Optional)</>
                )}
              </button>
            </div>

            {/* Detailed Area (collapsible) */}
            {showDetails && (
              <div className="space-y-4 pt-3 border-t border-dashed border-gray-200 dark:border-zinc-800">
                <div className="space-y-1.5">
                  <label
                    htmlFor="report-details"
                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Description of evidence of violation
                  </label>
                  <textarea
                    id="report-details"
                    rows={3}
                    value={reportForm.details}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        details: e.target.value,
                      })
                    }
                    placeholder="Provide additional details or specific context..."
                    className="w-full text-xs p-2 bg-slate-50 border border-gray-250 rounded-md outline-none h-20 resize-none focus:bg-white focus:border-indigo-300 transition dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Evidence images (Optional)
                  </label>

                  {/* Previews grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800"
                        >
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-650 text-white rounded-full p-1 opacity-90 transition-opacity cursor-pointer"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Image Button */}
                  <label className="flex items-center justify-center border border-dashed border-gray-250 dark:border-zinc-800 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                      <Image size={14} className="text-gray-400" />
                      <span>Select illustrative images or screenshots</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <p className="text-[10px] text-gray-500 leading-relaxed pt-1">
              If you see someone in danger, don't wait. Report it immediately
              to the authorities or local emergency services.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50/50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reportForm.reason}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-1">
                <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </span>
            ) : (
              <span>Report</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportUserModal;
