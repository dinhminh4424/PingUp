import React, { useState } from "react";
import { Scale, Check, X, AlertCircle, Eye, Search, Filter } from "lucide-react";

const AppealManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [appeals, setAppeals] = useState([
    {
      id: "APL-7294",
      user: "NguoiDung01",
      email: "NguoiDung01@gmail.com",
      type: "Post Removal",
      targetId: "post_182749",
      reason: "This post was just a sunset photo from my trip. It doesn't contain any policy violations or spam content. Please review again.",
      date: "2026-07-14",
      status: "Pending",
    },
    {
      id: "APL-6028",
      user: "dinhminh4424",
      email: "dinhminh4424@gmail.com",
      type: "Feature Restriction",
      targetId: "chat_limit",
      reason: "I was sending a link to my friend for homework help, not spamming. Please unlock my chat features.",
      date: "2026-07-13",
      status: "Pending",
    },
    {
      id: "APL-1048",
      user: "jack_ryan",
      email: "jack@example.com",
      type: "Account Warning",
      targetId: "strike_1",
      reason: "The system flagged my comment as harassment, but it was just a quote from a movie. No harm intended.",
      date: "2026-07-10",
      status: "Resolved",
      result: "Decision Upheld",
    },
  ]);

  const [selectedAppeal, setSelectedAppeal] = useState(null);

  const handleAction = (id, newStatus, resultMessage) => {
    setAppeals((prev) =>
      prev.map((apl) =>
        apl.id === id
          ? { ...apl, status: newStatus, result: resultMessage }
          : apl
      )
    );
    if (selectedAppeal && selectedAppeal.id === id) {
      setSelectedAppeal((prev) => ({ ...prev, status: newStatus, result: resultMessage }));
    }
  };

  const filteredAppeals = appeals.filter((apl) => {
    const matchesSearch =
      apl.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apl.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apl.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || apl.status.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-7 h-7 text-indigo-600" />
              User Appeals Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review and action content and account warnings appealed by users.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, appeal ID, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-55/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Content Table and Details split */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Table List */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="p-4 pl-6">Appeal ID</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAppeals.map((appeal) => (
                    <tr key={appeal.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 pl-6 font-semibold text-gray-900">{appeal.id}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-800">{appeal.user}</p>
                          <p className="text-xs text-gray-400">{appeal.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800">
                          {appeal.type}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500">{appeal.date}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          appeal.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {appeal.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedAppeal(appeal)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {appeal.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleAction(appeal.id, "Resolved", "Approved (Restored)")}
                                className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition cursor-pointer"
                                title="Approve Appeal"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(appeal.id, "Resolved", "Decision Upheld")}
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition cursor-pointer"
                                title="Reject Appeal"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAppeals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No appeals found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Sidebar panel */}
          {selectedAppeal && (
            <div className="w-full lg:w-96 bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Appeal details</h3>
                  <p className="text-xs text-gray-400">{selectedAppeal.id}</p>
                </div>
                <button
                  onClick={() => setSelectedAppeal(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <hr className="border-slate-100" />

              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">User</span>
                  <p className="font-medium text-gray-800">{selectedAppeal.user} ({selectedAppeal.email})</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Content ID</span>
                  <p className="font-medium text-slate-650 bg-slate-50 p-1.5 rounded-lg text-xs break-all mt-1">{selectedAppeal.targetId}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</span>
                  <p className="font-medium text-gray-800">{selectedAppeal.type}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Statement / Reason</span>
                  <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 text-xs italic">
                    "{selectedAppeal.reason}"
                  </p>
                </div>
                {selectedAppeal.result && (
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Result</span>
                    <p className="font-medium text-indigo-600 bg-indigo-50/50 p-2 rounded-lg text-xs mt-1">
                      {selectedAppeal.result}
                    </p>
                  </div>
                )}
              </div>

              {selectedAppeal.status === "Pending" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleAction(selectedAppeal.id, "Resolved", "Approved (Restored)")}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(selectedAppeal.id, "Resolved", "Decision Upheld")}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppealManagement;
