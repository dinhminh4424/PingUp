import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  ShieldAlert,
  Send,
  CheckCircle2,
  History,
  AlertCircle,
  Paperclip,
  X,
} from "lucide-react";
import { createAppeal, getAppeal } from "../../services/AppealServices";
import AppealDetailModal from "../../components/appeal/AppealDetailModal";

const Appeal = () => {
  const location = useLocation();
  const prefill = location.state || {};

  const [appealType, setAppealType] = useState(prefill.appealType || "Post Removal Appeal");
  const [targetModel, setTargetModel] = useState(prefill.targetModel || "Post");
  const [targetId, setTargetId] = useState(prefill.targetId || "");
  const [reason, setReason] = useState(prefill.reason || "");
  const [details, setDetails] = useState(prefill.details || "");
  const [submitted, setSubmitted] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    // Track raw files for FormData upload
    setMediaFiles((prev) => [...prev, ...files].slice(0, 3));

    // Track preview URLs
    const fileUrls = files.map((file) => URL.createObjectURL(file));
    setAttachments((prev) => [...prev, ...fileUrls].slice(0, 3));
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const [pastAppeals, setPastAppeals] = useState([]);
  const [viewingAppeal, setViewingAppeal] = useState(null);

  const fetchPastAppeals = async () => {
    try {
      const res = await getAppeal();
      if (res.success) {
        setPastAppeals(res.appeals || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch sử kháng nghị:", err);
    }
  };

  useEffect(() => {
    fetchPastAppeals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("targetId", targetId);
      formData.append("reason", reason);
      formData.append("appealType", appealType);
      formData.append("targetModel", targetModel);
      formData.append("details", details);
      mediaFiles.forEach((file) => {
        formData.append("media", file);
      });

      const result = await createAppeal(formData);
      if (result.success) {
        setSubmitted(true);
        fetchPastAppeals();
      } else {
        setError(result.message || "Failed to submit appeal.");
      }
    } catch (err) {
      console.error("Lỗi gửi appeal: ", err);
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative h-full overflow-y-auto bg-slate-50 p-6 md:p-10 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center flex flex-col items-center gap-5 py-12 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Appeal Submitted
            </h2>
            <p className="text-gray-500 text-sm">
              Our safety and moderation team will review your appeal. This
              process usually takes 24-48 hours.
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setReason("");
              setTargetId("");
              setDetails("");
              setTargetModel("Post");
              setAttachments([]);
              setMediaFiles([]);
            }}
            className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition active:scale-95 cursor-pointer"
          >
            Submit Another Appeal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Main Form */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Submit an Appeal
            </h1>
          </div>
          <p className="text-gray-500 mb-8">
            If you believe your post was removed or account restricted in error,
            please submit an appeal request below.
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Appeal Category
              </label>
              <select
                value={appealType}
                onChange={(e) => setAppealType(e.target.value)}
                className="px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 cursor-pointer"
              >
                <option value="Post Removal Appeal">Post Removal Appeal</option>
                <option value="Comment Removal Appeal">
                  Comment Removal Appeal
                </option>
                <option value="Chat/Message Restriction Appeal">
                  Chat/Message Restriction Appeal
                </option>
                <option value="Account Warning / Strike">
                  Account Warning / Strike
                </option>
                <option value="Account Suspension / Temporary Lock">
                  Account Suspension / Temporary Lock
                </option>
                <option value="Nudity & Sexual Content Strike Appeal">
                  Nudity & Sexual Content Strike Appeal
                </option>
                <option value="Hate Speech & Harassment Appeal">
                  Hate Speech & Harassment Appeal
                </option>
                <option value="Spam / False Positive Appeal">
                  Spam / False Positive Appeal
                </option>
                <option value="Intellectual Property / Copyright Appeal">
                  Intellectual Property / Copyright Appeal
                </option>
                <option value="Other Moderation Action">
                  Other Moderation Action
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Content Type (What is the ID for?)
              </label>
              <select
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                className="px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 cursor-pointer"
              >
                <option value="Post">Post</option>
                <option value="Comment">Comment</option>
                <option value="Conversation">Message</option>
                <option value="User">Account / User</option>
                <option value="Story">Story</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Target Content ID / Link (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. post_686e3e47ba0..."
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Why should this decision be reversed?
              </label>
              <textarea
                required
                rows={6}
                placeholder="Explain clearly why your content or account complies with our Community Guidelines..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Evidence / Attachments (Max 3 files/images)
              </label>
              <div className="flex flex-col gap-3">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 cursor-pointer bg-slate-50/30 transition hover:bg-indigo-50/5">
                  <Paperclip className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-600">
                    Choose images or files to upload
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, PDF up to 5MB
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {attachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-1">
                    {attachments.map((url, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-100/30"
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttachment(i)}
                          className="absolute top-1 right-1 p-1 bg-rose-500/80 hover:bg-rose-600 text-white rounded-full transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-800 text-xs">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                Please ensure all information provided is accurate. Frivolous
                appeals may lead to further account penalties. Review our
                Community Guidelines prior to submitting.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs">
                <AlertCircle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md text-sm transition active:scale-95 shadow-lg shadow-indigo-100 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Appeal
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Status Info */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Your Appeals</h2>
            </div>

            <div className="flex flex-col gap-3">
              {pastAppeals.map((appeal) => (
                <div
                  key={appeal._id}
                  onClick={() => setViewingAppeal(appeal)}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-200 cursor-pointer flex flex-col gap-1 text-xs transition active:scale-[0.98] duration-150"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      #{appeal._id.slice(-6).toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${appeal.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : appeal.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                    >
                      {appeal.status === "Pending"
                        ? "Pending"
                        : appeal.status === "Resolved"
                          ? "Approved"
                          : "Rejected"}
                    </span>
                  </div>
                  <span className="text-gray-500">{appeal.appealType}</span>
                  <span className="text-gray-400 mt-1">
                    {new Date(appeal.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  {appeal.result && (
                    <div className="mt-2 text-slate-700 font-medium bg-white p-2 rounded-lg border border-slate-100/60">
                      Result: {appeal.result === "Approved (Restored)"
                        ? "Approved (Restored)"
                        : "Decision Upheld"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appeal Details Modal */}
        <AppealDetailModal
          appeal={viewingAppeal}
          onClose={() => setViewingAppeal(null)}
        />
      </div>
    </div>
  );
};

export default Appeal;
