import React from "react";
import { Star, Eye, CheckCircle } from "lucide-react";

const FeedbackTable = ({ feedbacks, loading, onOpenDetail, onMarkReviewed }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải phản hồi...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Category</th>
                <th className="p-4">Rating</th>
                <th className="p-4 max-w-md">Message & Media</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-750">
              {feedbacks.map((fb) => (
                <tr
                  key={fb._id}
                  onClick={() => onOpenDetail(fb)}
                  className="hover:bg-slate-50/50 transition cursor-pointer"
                >
                  <td className="p-4 pl-6 font-semibold text-gray-900">
                    {fb._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={fb.userId?.profile_picture || "/default-avatar.avif"}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-gray-100"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {fb.userId?.full_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{fb.userId?.username || "anonymous"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                        fb.category === "bug"
                          ? "bg-rose-50 text-rose-700"
                          : fb.category === "suggestion"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {fb.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: fb.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                      {Array.from({ length: 5 - fb.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-slate-200" />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 max-w-md text-xs leading-relaxed text-slate-655">
                    <p className="italic font-medium text-slate-700 truncate max-w-sm">"{fb.comment}"</p>
                    {fb.media && fb.media.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {fb.media.map((url, i) => {
                          const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("/video");
                          return (
                            <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex-shrink-0">
                              {isVideo ? (
                                <video src={url} className="w-full h-full object-cover" muted />
                              ) : (
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-xs text-gray-505">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        fb.status === "New"
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "bg-slate-100 text-slate-505"
                      }`}
                    >
                      {fb.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onOpenDetail(fb)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Details</span>
                      </button>
                      {fb.status === "New" && (
                        <button
                          onClick={() => onMarkReviewed(fb._id)}
                          className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 hover:text-indigo-800 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                          title="Mark Reviewed"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Review</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    No feedback submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FeedbackTable;
