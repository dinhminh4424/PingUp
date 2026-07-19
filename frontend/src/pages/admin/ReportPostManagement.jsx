import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getReportPost,
  updateReportStatus,
} from "../../services/admin/ReportService";
import {
  togglePostActive,
  togglePostDelete,
  togglePostCommentDisabled,
} from "../../services/admin/PostService";
import { toggleUserActive } from "../../services/admin/UserService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import ReportDetailModal from "@/components/admin/report/ReportDetailModal";
import {
  Search,
  RefreshCw,
  Eye,
  Ban,
  Check,
  Mail,
  Calendar,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  Clock,
  UserCheck,
  XCircle,
} from "lucide-react";

const ReportPostManagement = () => {
  const [reportPost, setReportPost] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [reporterFilter, setReporterFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const reportReasons = [
    "Vấn đề liên quan đến người dưới 18 tuổi",
    "Bắt nạt, quấy rối hoặc lăng mạ/lạm dụng/ngược đãi",
    "Tự tử hoặc tự hại bản thân",
    "Nội dung mang tính bạo lực, thù ghét hoặc gây phiền toái",
    "Bán hoặc quảng bá mặt hàng bị hạn chế",
    "Nội dung người lớn",
    "Thông tin sai sự thật, lừa đảo hoặc gian lận",
    "Quyền sở hữu trí tuệ",
    "Tôi không muốn xem nội dung này",
  ];

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
    limit: 10,
  });

  // Overall Stats State
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0,
  });

  // Modal States
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const fetchReports = async (
    page = 1,
    query = searchQuery,
    status = statusFilter,
    reason = reasonFilter,
    reporter = reporterFilter,
    start = startDate,
    end = endDate,
  ) => {
    try {
      setLoading(true);
      setError("");

      const result = await getReportPost(
        query,
        status,
        start,
        end,
        page,
        reason,
        reporter,
      );

      if (result.success) {
        setReportPost(result.reportPosts);
        setPagination(result.pagination);
        setCurrentPage(result.pagination.currentPage);
        if (result.stats) {
          setStats(result.stats);
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách báo cáo",
      );
      toast.error(
        error.response?.data?.message || "Lỗi tải dữ liệu báo cáo bài viết!",
      );
      console.error("Lỗi: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(
      1,
      searchQuery,
      statusFilter,
      reasonFilter,
      reporterFilter,
      startDate,
      endDate,
    );
  }, [statusFilter, reasonFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchReports(
      1,
      searchQuery,
      statusFilter,
      reasonFilter,
      reporterFilter,
      startDate,
      endDate,
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setReasonFilter("all");
    setReporterFilter("");
    setStartDate("");
    setEndDate("");
    fetchReports(1, "", "all", "all", "", "", "");
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      setActionLoading(true);
      const result = await updateReportStatus(reportId, newStatus);
      if (result.success) {
        toast.success(
          `Đã cập nhật trạng thái báo cáo thành: ${
            newStatus === "resolved" ? "Giải quyết" : "Bác bỏ"
          }`,
        );

        // Refresh details modal state if active
        if (selectedReport && selectedReport._id === reportId) {
          setSelectedReport((prev) => ({
            ...prev,
            status: newStatus,
          }));
        }

        // Refresh list
        fetchReports(currentPage);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi cập nhật trạng thái báo cáo!",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePostCommentDisabled = async (postId) => {
    if (!postId) return;
    try {
      setActionLoading(true);
      const result = await togglePostCommentDisabled(postId);
      if (result.success) {
        toast.success(result.message);

        // Refresh details modal state if active
        if (
          selectedReport &&
          selectedReport.post &&
          selectedReport.post._id === postId
        ) {
          setSelectedReport((prev) => ({
            ...prev,
            post: {
              ...prev.post,
              isCommentDisabled: !prev.post.isCommentDisabled,
            },
          }));
        }

        // Refresh list
        fetchReports(currentPage);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Lỗi thay đổi trạng thái tính năng bình luận!",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePostActive = async (post) => {
    if (!post) return;
    try {
      setActionLoading(true);
      const result = await togglePostActive(post._id);
      if (result.success) {
        toast.success(result.message);

        // Refresh details modal state if active
        if (
          selectedReport &&
          selectedReport.post &&
          selectedReport.post._id === post._id
        ) {
          setSelectedReport((prev) => ({
            ...prev,
            post: {
              ...prev.post,
              isActive: !prev.post.isActive,
            },
          }));
        }

        // Refresh list
        fetchReports(currentPage);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi thay đổi trạng thái bài viết!",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserActive = async (user) => {
    if (!user) return;
    try {
      setActionLoading(true);
      const result = await toggleUserActive(user._id);
      if (result.success) {
        toast.success(result.message);

        // Refresh details modal state if active
        if (
          selectedReport &&
          selectedReport.post &&
          selectedReport.post.user &&
          selectedReport.post.user._id === user._id
        ) {
          setSelectedReport((prev) => ({
            ...prev,
            post: {
              ...prev.post,
              user: {
                ...prev.post.user,
                isActive: !prev.post.user.isActive,
              },
            },
          }));
        }

        // Refresh list
        fetchReports(currentPage);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi thay đổi trạng thái tài khoản!",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePostDelete = async (post) => {
    if (!post) return;
    try {
      setActionLoading(true);
      const result = await togglePostDelete(post._id);
      if (result.success) {
        toast.success(result.message);

        // Refresh details modal state if active
        if (
          selectedReport &&
          selectedReport.post &&
          selectedReport.post._id === post._id
        ) {
          setSelectedReport((prev) => ({
            ...prev,
            post: {
              ...prev.post,
              isDelete: !prev.post.isDelete,
            },
          }));
        }

        // Refresh list
        fetchReports(currentPage);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi thay đổi trạng thái xóa bài viết!",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleDateFilterChange = ({ startDate, endDate }) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  // Status badges formatter
  const renderStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Clock className="size-3" />
            Chờ xử lý
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="size-3" />
            Đã giải quyết
          </span>
        );
      case "dismissed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <XCircle className="size-3" />
            Đã bác bỏ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/10 text-slate-500 border border-slate-500/10">
            <HelpCircle className="size-3" />
            Không rõ
          </span>
        );
    }
  };

  // Post Status Badge
  const renderPostStatusBadge = (post) => {
    if (!post) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-600 border border-red-500/20">
          Đã xóa hoàn toàn
        </span>
      );
    }

    if (post.isDelete) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          Đã xóa (Lưu trữ)
        </span>
      );
    }

    if (!post.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Đang bị khóa
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        Hoạt động
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý báo cáo bài viết
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi danh sách báo cáo, kiểm duyệt bài viết và áp dụng các biện
            pháp xử lý.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchReports(currentPage)}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Tải lại dữ liệu
        </Button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Tổng báo cáo
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {stats.total}
              </h3>
            </div>
            <div className="size-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
              <FileText className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Chờ xử lý
              </p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">
                {stats.pending}
              </h3>
            </div>
            <div className="size-10 bg-amber-500/5 rounded-lg flex items-center justify-center text-amber-500">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Đã giải quyết
              </p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-500">
                {stats.resolved}
              </h3>
            </div>
            <div className="size-10 bg-emerald-500/5 rounded-lg flex items-center justify-center text-emerald-500">
              <UserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Đã bác bỏ
              </p>
              <h3 className="text-2xl font-bold mt-1 text-slate-600 dark:text-slate-400">
                {stats.dismissed}
              </h3>
            </div>
            <div className="size-10 bg-slate-500/5 rounded-lg flex items-center justify-center text-slate-500">
              <XCircle className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Query Section */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
              {/* Row 1: Search & Reporter Filter */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo ID Báo cáo, nội dung bài viết..."
                    className="pl-9 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Lọc theo người báo cáo (tên/username)..."
                    className="pl-9 text-xs"
                    value={reporterFilter}
                    onChange={(e) => setReporterFilter(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full md:w-auto h-9 text-xs px-6"
                >
                  Tìm kiếm
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 border-dashed">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Lọc theo ngày:
                  </span>
                  <DateRangeFilter onFilterChange={handleDateFilterChange} />
                </div>

                <div className="w-40">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs transition-colors outline-none cursor-pointer focus:border-ring"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="resolved">Đã giải quyết</option>
                    <option value="dismissed">Đã bác bỏ</option>
                  </select>
                </div>

                <div className="w-56">
                  <select
                    value={reasonFilter}
                    onChange={(e) => setReasonFilter(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs transition-colors outline-none cursor-pointer focus:border-ring"
                  >
                    <option value="all">Tất cả lý do báo cáo</option>
                    {reportReasons.map((reason, idx) => (
                      <option key={idx} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(searchQuery ||
                statusFilter !== "all" ||
                reasonFilter !== "all" ||
                reporterFilter ||
                startDate ||
                endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 gap-1.5"
                >
                  <RotateCcw className="size-3" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="shadow-xs border-border overflow-hidden">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Danh sách báo cáo</CardTitle>
            <span className="text-xs text-muted-foreground">
              Hiển thị {reportPost.length} kết quả trên trang này
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[80px] pl-4 py-3">
                    Mã báo cáo
                  </TableHead>
                  <TableHead className="w-[125px]">Người báo cáo</TableHead>
                  <TableHead className="w-[145px]">
                    Bài viết bị báo cáo
                  </TableHead>
                  <TableHead className="w-[135px]">Lý do báo cáo</TableHead>
                  <TableHead className="w-[110px]">Ngày báo cáo</TableHead>
                  <TableHead className="w-[95px]">Trạng thái BC</TableHead>
                  <TableHead className="w-[95px]">Trạng thái BV</TableHead>
                  <TableHead className="w-[55px] text-center pr-4">
                    Chi tiết
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  // Skeleton rows when loading
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-4 py-4">
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-7 rounded-full" />
                          <div className="flex flex-col gap-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-2.5 w-12" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-7 rounded" />
                          <div className="flex flex-col gap-1 flex-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-2.5 w-12" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-3 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4.5 w-14 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4.5 w-14 rounded-full" />
                      </TableCell>
                      <TableCell className="pr-4 text-center">
                        <Skeleton className="size-6 rounded-md mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : reportPost.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-48 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="size-8 text-muted-foreground/40" />
                        <p className="font-medium text-sm">
                          Không tìm thấy báo cáo nào
                        </p>
                        <p className="text-xs">
                          Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc thời
                          gian.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reportPost.map((report) => (
                    <TableRow
                      key={report._id}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      {/* Report ID */}
                      <TableCell className="pl-4 font-mono text-xs font-semibold text-foreground/80">
                        #{report._id.slice(-6).toUpperCase()}
                      </TableCell>

                      {/* Reporter */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7 border border-border">
                            <AvatarImage
                              src={report.reporterId?.profile_picture}
                              alt={report.reporterId?.full_name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/5 text-primary text-[9px] font-semibold">
                              {getInitials(
                                report.reporterId?.full_name ||
                                  report.reporterId?.username,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span
                              className="font-semibold text-[11px] text-foreground truncate max-w-[85px]"
                              title={report.reporterId?.full_name}
                            >
                              {report.reporterId?.full_name || "Chưa đặt tên"}
                            </span>
                            <span
                              className="text-[9px] text-muted-foreground truncate max-w-[85px]"
                              title={report.reporterId?.username}
                            >
                              @{report.reporterId?.username || "unknown"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Targeted Post */}
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-[135px]">
                          {report.post?.image_urls?.[0] ? (
                            <img
                              src={report.post.image_urls[0]}
                              alt="Thumbnail"
                              className="size-7 rounded object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="size-7 bg-muted rounded flex items-center justify-center text-muted-foreground shrink-0 border">
                              <ImageIcon className="size-3" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span
                              className="text-[11px] text-foreground font-medium truncate"
                              title={
                                report.post?.content ||
                                "(Không có nội dung chữ)"
                              }
                            >
                              {report.post?.content ||
                                "(Không có nội dung chữ)"}
                            </span>
                            <span className="text-[9px] text-muted-foreground truncate">
                              Bởi @{report.post?.user?.username || "unknown"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="text-[11px] font-medium text-foreground/90 max-w-[125px]">
                        <span className="line-clamp-2" title={report.reason}>
                          {report.reason}
                        </span>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="text-[10px] text-muted-foreground">
                        {formatDate(report.createdAt)}
                      </TableCell>

                      {/* Report Status */}
                      <TableCell>{renderStatusBadge(report.status)}</TableCell>

                      {/* Post Status */}
                      <TableCell>
                        {renderPostStatusBadge(report.post)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-4 text-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => handleViewDetails(report)}
                          title="Xem chi tiết"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-xs text-muted-foreground">
                Đang hiển thị trang <b>{pagination.currentPage}</b> trên tổng số{" "}
                <b>{pagination.totalPages}</b> trang
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => fetchReports(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      className="size-8 text-xs font-medium"
                      onClick={() => fetchReports(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => fetchReports(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages || loading}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          isDetailOpen={isDetailOpen}
          selectedReport={selectedReport}
          setIsDetailOpen={setIsDetailOpen}
          actionLoading={actionLoading}
          handleUpdateStatus={handleUpdateStatus}
          handleTogglePostActive={handleTogglePostActive}
          handleTogglePostDelete={handleTogglePostDelete}
          handleToggleUserActive={handleToggleUserActive}
          handleTogglePostCommentDisabled={handleTogglePostCommentDisabled}
        />
      )}
    </div>
  );
};

export default ReportPostManagement;
