import React, { useState } from "react";
import {
  ShieldAlert,
  Send,
  FileText,
  CheckCircle2,
  History,
  AlertCircle,
} from "lucide-react";

const Appeal = () => {
  const [appealType, setAppealType] = useState("post_removal");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Mock list of past appeals to make the page feel rich & authentic
  const [pastAppeals] = useState([
    {
      id: "APL-7294",
      date: "2026-07-10",
      type: "Post Removal Appeal",
      status: "Resolved",
      result: "Approved (Post restored)",
    },
    {
      id: "APL-1048",
      date: "2026-06-15",
      type: "Account Feature Restriction",
      status: "Rejected",
      result: "Decision Upheld",
    },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    // Simulate submission
    setSubmitted(true);
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
                <option value="post_removal">Post Removal Appeal</option>
                <option value="account_warning">
                  Account Warning / Strike
                </option>
                <option value="feature_block">
                  Feature Restriction (e.g. Chat/Comment lock)
                </option>
                <option value="other">Other Moderation Action</option>
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

            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-800 text-xs">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                Please ensure all information provided is accurate. Frivolous
                appeals may lead to further account penalties. Review our
                Community Guidelines prior to submitting.
              </p>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md text-sm transition active:scale-95 shadow-lg shadow-indigo-100 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Submit Appeal
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
                  key={appeal.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      {appeal.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        appeal.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {appeal.status}
                    </span>
                  </div>
                  <span className="text-gray-500">{appeal.type}</span>
                  <span className="text-gray-400 mt-1">{appeal.date}</span>
                  {appeal.result && (
                    <div className="mt-2 text-slate-700 font-medium bg-white p-2 rounded-lg border border-slate-100/60">
                      Result: {appeal.result}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appeal;
