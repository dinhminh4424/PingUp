import React, { useEffect, useState } from "react";
import { MessageSquare, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { getFeedbacks } from "../../services/admin/FeedbackService";
import DateRangeFilter from "../../components/admin/DateRangeFilter";
import FeedbackStatsCards from "../../components/admin/feedback/FeedbackStatsCards";
import FeedbackTable from "../../components/admin/feedback/FeedbackTable";
import FeedbackDetailModal from "../../components/admin/feedback/FeedbackDetailModal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [filterResetKey, setFilterResetKey] = useState(0);
  
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

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
    setFilterRating("all");
    setDateRange({ startDate: "", endDate: "" });
    setFilterResetKey((prev) => prev + 1);
    setPage(1);
    toast.success("Đã đặt lại các bộ lọc");
  };

  useEffect(() => {
    fetchFeedback();
  }, [searchTerm, filterCategory, filterRating, dateRange, page]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600 animate-pulse" />
            Quản lý phản hồi người dùng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xem đánh giá, đề xuất và báo cáo lỗi do người dùng gửi.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchFeedback}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Tải lại dữ liệu
        </Button>
      </div>

      {error && <p className="text-red-600 font-medium">{error}</p>}

      {/* Stats Grid component */}
      <FeedbackStatsCards stats={stats} />

      {/* Main Table Card */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Danh sách phản hồi</CardTitle>
              <CardDescription>
                Hiện có {totalFeedbacksCount} phản hồi phù hợp với bộ lọc.
              </CardDescription>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo người dùng, bình luận..."
                  className="pl-8 h-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Date Filter Component */}
              <DateRangeFilter key={filterResetKey} onFilterChange={handleDateFilterChange} />

              {/* Category Filter */}
              <select
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả danh mục</option>
                <option value="suggestion">Đề xuất</option>
                <option value="bug">Báo cáo lỗi</option>
                <option value="compliment">Lời khen</option>
                <option value="other">Khác</option>
              </select>

              {/* Rating Filter */}
              <select
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={filterRating}
                onChange={(e) => {
                  setFilterRating(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả đánh giá</option>
                <option value="5">5 Sao</option>
                <option value="4">4 Sao</option>
                <option value="3">3 Sao</option>
                <option value="2">2 Sao</option>
                <option value="1">1 Sao</option>
              </select>

              {/* Reset Filters Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="Đặt lại tất cả bộ lọc"
              >
                <RotateCcw className="size-3" />
                Đặt lại
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <FeedbackTable
            feedbacks={feedbacks}
            loading={loading}
            onOpenDetail={handleOpenDetail}
            onMarkReviewed={handleMarkReviewed}
          />

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted/10">
              <div className="text-xs text-muted-foreground">
                Hiển thị trang <span className="font-semibold text-foreground">{page}</span> trên tổng số{" "}
                <span className="font-semibold text-foreground">{totalPages}</span> trang ({totalFeedbacksCount} kết quả)
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="h-8 text-xs"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="h-8 text-xs"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
