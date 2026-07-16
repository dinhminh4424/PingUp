import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getPosts,
  togglePostActive,
  togglePostDelete,
} from "@/services/admin/PostService";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, RotateCcw } from "lucide-react";

import DateRangeFilter from "@/components/admin/DateRangeFilter";
import PostStatsCards from "@/components/admin/posts/PostStatsCards";
import PostTable from "@/components/admin/posts/PostTable";
import PostDetailModal from "@/components/admin/posts/PostDetailModal";

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Date filter state
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [filterResetKey, setFilterResetKey] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPostsCount, setTotalPostsCount] = useState(0);

  // Detail post modal state
  const [selectedPost, setSelectedPost] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalPosts: 0,
    activePosts: 0,
    blockedPosts: 0,
    deletedPosts: 0,
  });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getPosts(
        debouncedSearchQuery,
        statusFilter,
        dateRange.startDate,
        dateRange.endDate,
        page
      );
      if (result.success) {
        setPosts(result.posts);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalPostsCount(result.pagination.totalPosts || 0);
        }
        if (result.stats) {
          setStats(result.stats);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách bài viết"
      );
      toast.error(
        err.response?.data?.message || "Lỗi tải dữ liệu bài viết!"
      );
      console.error("Lỗi: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [debouncedSearchQuery, statusFilter, dateRange, page]);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleToggleActive = async (postId) => {
    try {
      const result = await togglePostActive(postId);
      if (result.success) {
        toast.success(result.message);

        // Update posts state locally
        setPosts((prevPosts) => {
          const updated = prevPosts.map((post) =>
            post._id === postId ? { ...post, isActive: result.post.isActive } : post
          );
          if (statusFilter === "active" && !result.post.isActive) {
            return updated.filter((post) => post._id !== postId);
          }
          if (statusFilter === "blocked" && result.post.isActive) {
            return updated.filter((post) => post._id !== postId);
          }
          return updated;
        });

        // Update stats state locally
        setStats((prevStats) => {
          const isNowActive = result.post.isActive;
          return {
            ...prevStats,
            activePosts: prevStats.activePosts + (isNowActive ? 1 : -1),
            blockedPosts: prevStats.blockedPosts + (isNowActive ? -1 : 1),
          };
        });

        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost((prev) => ({ ...prev, isActive: result.post.isActive }));
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi khi cập nhật trạng thái hoạt động!"
      );
    }
  };

  const handleToggleDelete = async (postId) => {
    try {
      const result = await togglePostDelete(postId);
      if (result.success) {
        toast.success(result.message);

        // Update posts state locally
        setPosts((prevPosts) => {
          const updated = prevPosts.map((post) =>
            post._id === postId ? { ...post, isDelete: result.post.isDelete } : post
          );
          if (statusFilter === "deleted" && !result.post.isDelete) {
            return updated.filter((post) => post._id !== postId);
          }
          if (statusFilter !== "deleted" && result.post.isDelete) {
            return updated.filter((post) => post._id !== postId);
          }
          return updated;
        });

        // Update stats state locally
        setStats((prevStats) => {
          const isNowDeleted = result.post.isDelete;
          return {
            ...prevStats,
            totalPosts: prevStats.totalPosts + (isNowDeleted ? -1 : 1),
            deletedPosts: prevStats.deletedPosts + (isNowDeleted ? 1 : -1),
          };
        });

        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost((prev) => ({ ...prev, isDelete: result.post.isDelete }));
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi khi cập nhật trạng thái xóa!"
      );
    }
  };

  const handleDateFilterChange = (range) => {
    setDateRange(range);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRange({ startDate: "", endDate: "" });
    setFilterResetKey((prev) => prev + 1);
    setPage(1);
    toast.success("Đã đặt lại các bộ lọc");
  };

  const handleCommentAdded = (postId, newComment) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p._id === postId) {
          const updatedComments = [newComment, ...(p.comments || [])];
          return {
            ...p,
            comments_count: updatedComments.length,
            comments: updatedComments,
          };
        }
        return p;
      })
    );

    setSelectedPost((prev) => {
      if (prev && prev._id === postId) {
        const updatedComments = [newComment, ...(prev.comments || [])];
        return {
          ...prev,
          comments_count: updatedComments.length,
          comments: updatedComments,
        };
      }
      return prev;
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý bài viết</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kiểm duyệt bài viết, xem các báo cáo vi phạm và quản lý ẩn/hiện nội dung trên bảng tin.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPosts}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Tải lại dữ liệu
        </Button>
      </div>

      {error && <p className="text-red-600 font-medium">{error}</p>}

      {/* Stats Cards */}
      <PostStatsCards stats={stats} loading={loading} />

      {/* Main Table Card */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Danh sách bài viết</CardTitle>
              <CardDescription>
                Hiện có {totalPostsCount} bài viết phù hợp với bộ lọc.
              </CardDescription>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Tìm nội dung, tác giả..."
                  className="pl-8 h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Select */}
              <select
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="blocked">Đang bị khóa</option>
                <option value="deleted">Đã xóa</option>
              </select>

              {/* Date Filter Component */}
              <DateRangeFilter key={filterResetKey} onFilterChange={handleDateFilterChange} />

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
          <PostTable
            posts={posts}
            loading={loading}
            onViewDetail={setSelectedPost}
            onToggleActive={handleToggleActive}
            onToggleDelete={handleToggleDelete}
            formatDate={formatDate}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted/10">
              <div className="text-xs text-muted-foreground">
                Hiển thị trang <span className="font-semibold text-foreground">{page}</span> trên tổng số{" "}
                <span className="font-semibold text-foreground">{totalPages}</span> trang ({totalPostsCount} kết quả)
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="h-8 text-xs"
                >
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    if (
                      totalPages > 6 &&
                      pageNum !== 1 &&
                      pageNum !== totalPages &&
                      Math.abs(pageNum - page) > 1
                    ) {
                      if (pageNum === 2 && page > 3) {
                        return (
                          <span key={pageNum} className="px-1.5 text-xs text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      if (pageNum === totalPages - 1 && page < totalPages - 2) {
                        return (
                          <span key={pageNum} className="px-1.5 text-xs text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 text-xs p-0"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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

      {/* Post details modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onToggleActive={handleToggleActive}
          onToggleDelete={handleToggleDelete}
          formatDate={formatDate}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
};

export default PostManagement;
