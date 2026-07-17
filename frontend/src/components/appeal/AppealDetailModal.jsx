import React from "react";
import { X } from "lucide-react";

const AppealDetailModal = ({ appeal, onClose }) => {
  if (!appeal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Appeal Details</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              #{appeal._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="p-6 overflow-y-auto flex flex-col gap-5 text-sm scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Appeal Category
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                {appeal.appealType}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Submitted Date
              </span>
              <span className="text-gray-700 font-medium">
                {new Date(appeal.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Target model and ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Content Type
              </span>
              <span className="text-gray-800 font-semibold text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                {appeal.targetModel === "Post"
                  ? "Post"
                  : appeal.targetModel === "Comment"
                    ? "Comment"
                    : appeal.targetModel === "Conversation"
                      ? "Message"
                      : appeal.targetModel === "Story"
                        ? "Story"
                        : "Account / User"}
              </span>
            </div>
            {appeal.targetId && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Content ID
                </span>
                <span className="text-xs font-mono bg-slate-50 p-1 px-2 rounded-md text-slate-600 break-all select-all block w-full">
                  {appeal.targetId}
                </span>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Status & Result */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Moderation Status
            </span>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    appeal.status === "Pending"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : appeal.status === "Resolved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {appeal.status === "Pending"
                    ? "Pending Review"
                    : appeal.status === "Resolved"
                      ? "Approved (Restored)"
                      : "Rejected"}
                </span>
              </div>
              {appeal.result && (
                <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl text-indigo-900 text-xs">
                  <p className="font-bold mb-1">Moderation Result:</p>
                  <p className="font-medium text-[11px] leading-relaxed">
                    {appeal.result === "Approved (Restored)"
                      ? "Your appeal has been approved. The associated content has been successfully restored to its normal status."
                      : "After careful review of the provided information, we have decided to uphold the original moderation decision."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Reason */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Your Appeal Reason
            </span>
            <p className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-xs text-gray-700 leading-relaxed font-medium italic">
              "{appeal.reason}"
            </p>
          </div>

          {/* Details */}
          {appeal.details && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Additional Details
              </span>
              <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap">
                {appeal.details}
              </p>
            </div>
          )}

          {/* Media Attachments */}
          {appeal.media && appeal.media.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Evidence / Attachments ({appeal.media.length})
              </span>
              <div className="grid grid-cols-3 gap-3">
                {appeal.media.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center group"
                  >
                    <img
                      src={url}
                      alt="Evidence"
                      className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition duration-200"
                      onClick={() => window.open(url, "_blank")}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppealDetailModal;
