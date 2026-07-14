import React, { useState } from "react";
import { MessageSquare, Star, Search, Filter, CheckCircle, ShieldAlert, Archive } from "lucide-react";

const FeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRating, setFilterRating] = useState("all");

  const [feedbacks, setFeedbacks] = useState([
    {
      id: "FB-9182",
      user: "NguoiDung01",
      email: "NguoiDung01@gmail.com",
      category: "suggestion",
      rating: 5,
      comment: "Love the new glassmorphism sidebar! It feels extremely premium and smooth. Keep up the good work!",
      date: "2026-07-14",
      status: "New",
    },
    {
      id: "FB-3029",
      user: "dinhminh4424",
      email: "dinhminh4424@gmail.com",
      category: "bug",
      rating: 3,
      comment: "Sometimes the chat message list doesn't auto-scroll to the bottom immediately when a new message is received. Please check.",
      date: "2026-07-13",
      status: "New",
    },
    {
      id: "FB-1048",
      user: "alexa_james",
      email: "alexa@example.com",
      category: "compliment",
      rating: 5,
      comment: "Very nice interface and responsive speed. The user experience is outstanding compared to other apps.",
      date: "2026-07-10",
      status: "Reviewed",
    },
  ]);

  const handleMarkReviewed = (id) => {
    setFeedbacks((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, status: "Reviewed" } : fb))
    );
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch =
      fb.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === "all" || fb.category === filterCategory;
    const matchesRating = filterRating === "all" || fb.rating === parseInt(filterRating);

    return matchesSearch && matchesCategory && matchesRating;
  });

  // Calculate statistics
  const totalCount = feedbacks.length;
  const avgRating = (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / totalCount || 0).toFixed(1);
  const bugCount = feedbacks.filter((fb) => fb.category === "bug").length;
  const suggestionCount = feedbacks.filter((fb) => fb.category === "suggestion").length;

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-indigo-600" />
            User Feedback Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review ratings, suggestions, and bug reports submitted by users.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Feedback</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalCount} submissions</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Average Rating</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{avgRating} / 5.0</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Bug Reports</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{bugCount} active bugs</h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, ID, message content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-55/30"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="suggestion">Suggestions</option>
                <option value="bug">Bug Reports</option>
                <option value="compliment">Compliments</option>
                <option value="other">Others</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 max-w-md">Message</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFeedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 pl-6 font-semibold text-gray-900">{fb.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-gray-800">{fb.user}</p>
                        <p className="text-xs text-gray-400">{fb.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                        fb.category === "bug"
                          ? "bg-rose-50 text-rose-700"
                          : fb.category === "suggestion"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-indigo-50 text-indigo-700"
                      }`}>
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
                    <td className="p-4 max-w-md text-xs leading-relaxed text-slate-600 italic">
                      "{fb.comment}"
                    </td>
                    <td className="p-4 text-xs text-gray-500">{fb.date}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        fb.status === "New" ? "bg-indigo-50 text-indigo-700 font-semibold" : "bg-slate-100 text-slate-500"
                      }`}>
                        {fb.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        {fb.status === "New" && (
                          <button
                            onClick={() => handleMarkReviewed(fb.id)}
                            className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-650 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium text-indigo-600"
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
                {filteredFeedbacks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      No feedback submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FeedbackManagement;
