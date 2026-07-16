import React, { useEffect, useState } from "react";
import { MessageSquare, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { getFeedbacks } from "../../services/admin/FeedbackService";
import DateRangeFilter from "../../components/admin/DateRangeFilter";
import FeedbackStatsCards from "../../components/admin/feedback/FeedbackStatsCards";
import FeedbackTable from "../../components/admin/feedback/FeedbackTable";
import FeedbackDetailModal from "../../components/admin/feedback/FeedbackDetailModal";

const FeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  
  // Date filter state
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const [feedbacks, setFeedbacks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeedbacksCount, setTotalFeedbacksCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [stats, setStats] = useState({
    totalCount: 0,
    avgRating: "0.0",
    bugCount: 0,
  });

  const fetchFeedback = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getFeedbacks(
        searchTerm,
        filterCategory,
        filterRating,
        dateRange.startDate,
        dateRange.endDate,
        page
      );
      if (result.success) {
        setFeedbacks(result.feedbacks || []);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalFeedbacksCount(result.pagination.totalFeedbacks || 0);
        }
        
        // Calculate statistics locally from results
        const list = result.feedbacks || [];
        const total = result.pagination?.totalFeedbacks || list.length;
        const sum = list.reduce((a, b) => a + b.rating, 0);
        const avg = total > 0 ? (sum / list.length || 0).toFixed(1) : "0.0";
        const bugs = list.filter((f) => f.category === "bug").length;

        setStats({
          totalCount: total,
          avgRating: avg,
          bugCount: bugs,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách phản hồi"
      );
      toast.error(err.response?.data?.message || "Lỗi tải dữ liệu phản hồi!");
      console.error("Lỗi: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = (id) => {
    setFeedbacks((prev) =>
      prev.map((fb) => (fb._id === id ? { ...fb, status: "Reviewed" } : fb))
    );
    toast.success("Feedback marked as reviewed!");
  };

  const handleOpenDetail = (feedback) => {
    setSelectedFeedback(feedback);
    setIsModalOpen(true);
  };

  const handleDateFilterChange = (range) => {
    setDateRange(range);
    setPage(1);
  };

  useEffect(() => {
    fetchFeedback();
  }, [searchTerm, filterCategory, filterRating, dateRange, page]);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-indigo-600" />
              User Feedback Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Review ratings, suggestions, and bug reports submitted by users.
            </p>
          </div>
        </div>

        {/* Stats Grid component */}
        <FeedbackStatsCards stats={stats} />

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, comment content..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-55/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Date range filter component */}
            <DateRangeFilter onFilterChange={handleDateFilterChange} />

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPage(1);
                }}
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
                onChange={(e) => {
                  setFilterRating(e.target.value);
                  setPage(1);
                }}
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

        {/* Content Table component */}
        <FeedbackTable
          feedbacks={feedbacks}
          loading={loading}
          onOpenDetail={handleOpenDetail}
          onMarkReviewed={handleMarkReviewed}
        />

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-xs text-gray-550">
              Showing page {page} of {totalPages} ({totalFeedbacksCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-55 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-55 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Detail Modal component */}
      <FeedbackDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedback={selectedFeedback}
        onMarkReviewed={handleMarkReviewed}
      />
    </div>
  );
};

export default FeedbackManagement;
