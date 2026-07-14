import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getReportPost, updateReportStatus } from "../../services/admin/ReportService";
import { togglePostActive, togglePostDelete } from "../../services/admin/PostService";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const result = await getReportPost(searchQuery, statusFilter, startDate, endDate, page);

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
    fetchReports(1);
  }, [statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchReports(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    // Trigger reset list
    fetchReports(1);
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      setActionLoading(true);
      const result = await updateReportStatus(reportId, newStatus);
      if (result.success) {
        toast.success(`Đã cập nhật trạng thái báo cáo thành: ${
          newStatus === "resolved" ? "Giải quyết" : "Bác bỏ"
        }`);
        
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
      toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái báo cáo!");
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
        if (selectedReport && selectedReport.post && selectedReport.post._id === post._id) {
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
      toast.error(err.response?.data?.message || "Lỗi thay đổi trạng thái bài viết!");
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
        if (selectedReport && selectedReport.post && selectedReport.post._id === post._id) {
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
      toast.error(err.response?.data?.message || "Lỗi thay đổi trạng thái xóa bài viết!");
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Clock className="size-3" />
            Chờ xử lý
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="size-3" />
            Đã giải quyết
          </span>
        );
      case "dismissed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <XCircle className="size-3" />
            Đã bác bỏ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 border border-slate-500/10">
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
            Theo dõi danh sách báo cáo, kiểm duyệt bài viết và áp dụng các biện pháp xử lý.
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
              <p className="text-xs text-muted-foreground font-medium">Tổng báo cáo</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.total}</h3>
            </div>
            <div className="size-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
              <FileText className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Chờ xử lý</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">{stats.pending}</h3>
            </div>
            <div className="size-10 bg-amber-500/5 rounded-lg flex items-center justify-center text-amber-500">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Đã giải quyết</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-500">{stats.resolved}</h3>
            </div>
            <div className="size-10 bg-emerald-500/5 rounded-lg flex items-center justify-center text-emerald-500">
              <UserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Đã bác bỏ</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-600 dark:text-slate-400">{stats.dismissed}</h3>
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
            
            {/* Search and Main Status filter */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo ID Báo cáo, nội dung bài viết, người báo cáo..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none cursor-pointer focus:border-ring"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="resolved">Đã giải quyết</option>
                  <option value="dismissed">Đã bác bỏ</option>
                </select>
              </div>

              <Button type="submit" variant="default" className="w-full md:w-auto h-9">
                Tìm kiếm
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 border-dashed">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground">Lọc theo ngày:</span>
                <DateRangeFilter onFilterChange={handleDateFilterChange} />
              </div>

              {(searchQuery || statusFilter !== "all" || startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-1.5"
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
                  <TableHead className="w-[120px] pl-6 py-3">Mã báo cáo</TableHead>
                  <TableHead className="w-[200px]">Người báo cáo</TableHead>
                  <TableHead className="w-[220px]">Bài viết bị báo cáo</TableHead>
                  <TableHead className="w-[180px]">Lý do báo cáo</TableHead>
                  <TableHead className="w-[150px]">Ngày báo cáo</TableHead>
                  <TableHead className="w-[120px]">Trạng thái BC</TableHead>
                  <TableHead className="w-[120px]">Trạng thái BV</TableHead>
                  <TableHead className="w-[100px] text-center pr-6">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  // Skeleton rows when loading
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6 py-4">
                        <Skeleton className="h-4 w-14" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-8 rounded-full" />
                          <div className="flex flex-col gap-1">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-8 rounded" />
                          <div className="flex flex-col gap-1 flex-1">
                            <Skeleton className="h-3.5 w-full" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="pr-6 text-center">
                        <Skeleton className="size-7 rounded-md mx-auto" />
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
                          Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc thời gian.
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
                      <TableCell className="pl-6 font-mono text-xs font-semibold text-foreground/80">
                        #{report._id.slice(-6).toUpperCase()}
                      </TableCell>

                      {/* Reporter */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 border border-border">
                            <AvatarImage
                              src={report.reporterId?.profile_picture}
                              alt={report.reporterId?.full_name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-semibold">
                              {getInitials(report.reporterId?.full_name || report.reporterId?.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs text-foreground truncate max-w-[130px]">
                              {report.reporterId?.full_name || "Chưa đặt tên"}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                              @{report.reporterId?.username || "unknown"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Targeted Post */}
                      <TableCell>
                        <div className="flex items-center gap-2.5 max-w-[200px]">
                          {report.post?.image_urls?.[0] ? (
                            <img
                              src={report.post.image_urls[0]}
                              alt="Thumbnail"
                              className="size-8 rounded object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="size-8 bg-muted rounded flex items-center justify-center text-muted-foreground shrink-0 border">
                              <ImageIcon className="size-3.5" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-foreground font-medium truncate">
                              {report.post?.content || "(Không có nội dung chữ)"}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              Bởi @{report.post?.user?.username || "unknown"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="text-xs font-medium text-foreground/90">
                        <span className="line-clamp-2" title={report.reason}>
                          {report.reason}
                        </span>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="text-[11px] text-muted-foreground">
                        {formatDate(report.createdAt)}
                      </TableCell>

                      {/* Report Status */}
                      <TableCell>{renderStatusBadge(report.status)}</TableCell>

                      {/* Post Status */}
                      <TableCell>{renderPostStatusBadge(report.post)}</TableCell>

                      {/* Actions */}
                      <TableCell className="pr-6 text-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => handleViewDetails(report)}
                          title="Xem chi tiết"
                        >
                          <Eye className="size-4" />
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
                Đang hiển thị trang <b>{pagination.currentPage}</b> trên tổng số <b>{pagination.totalPages}</b> trang
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
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl w-[95vw] md:max-w-4xl rounded-xl p-0 overflow-hidden border border-border shadow-2xl">
            <DialogHeader className="p-5 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    Chi tiết Báo cáo
                    <span className="font-mono text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                      #{selectedReport._id.toUpperCase()}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Gửi lúc {formatDate(selectedReport.createdAt)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border max-h-[70vh] overflow-y-auto">
              
              {/* Left Column: Report Information */}
              <div className="p-6 flex flex-col gap-5">
                <h3 className="text-sm font-bold tracking-tight text-primary flex items-center gap-1.5 border-b pb-2">
                  <AlertTriangle className="size-4" />
                  NỘI DUNG BÁO CÁO
                </h3>

                {/* Reporter Card */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Người báo cáo</h4>
                  <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <Avatar className="size-10 border border-border">
                      <AvatarImage
                        src={selectedReport.reporterId?.profile_picture}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {getInitials(selectedReport.reporterId?.full_name || selectedReport.reporterId?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-foreground truncate">
                        {selectedReport.reporterId?.full_name || "Chưa cập nhật"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        @{selectedReport.reporterId?.username}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <Mail className="size-3 shrink-0" />
                        {selectedReport.reporterId?.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason & Description */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Lý do báo cáo</h4>
                    <p className="text-sm font-semibold text-foreground bg-amber-500/5 text-amber-800 dark:text-amber-300 px-3 py-2 rounded-md border border-amber-500/10">
                      {selectedReport.reason}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1 font-medium">Chi tiết mô tả</h4>
                    <p className="text-sm text-foreground/80 bg-muted/30 px-3 py-2 rounded-md border whitespace-pre-line leading-relaxed">
                      {selectedReport.details || "(Không có mô tả chi tiết từ người báo cáo)"}
                    </p>
                  </div>
                </div>

                {/* Proof Attachment */}
                {selectedReport.file && selectedReport.file.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Ảnh bằng chứng đính kèm</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReport.file.map((imgUrl, i) => (
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          key={i}
                          className="relative group aspect-video rounded-lg overflow-hidden border border-border/80 hover:border-primary/50 transition-colors"
                        >
                          <img
                            src={imgUrl}
                            alt={`Bằng chứng ${i + 1}`}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-[11px] font-medium px-2 py-1 rounded bg-black/60">Xem ảnh lớn</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report Status Handle */}
                <div className="mt-auto pt-4 border-t border-dashed">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Trạng thái báo cáo hiện tại</h4>
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">{renderStatusBadge(selectedReport.status)}</div>
                    
                    <div className="flex gap-1.5 flex-1">
                      {selectedReport.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs font-semibold"
                            onClick={() => handleUpdateStatus(selectedReport._id, "resolved")}
                            disabled={actionLoading}
                          >
                            Duyệt Giải quyết
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:hover:bg-rose-950/20"
                            onClick={() => handleUpdateStatus(selectedReport._id, "dismissed")}
                            disabled={actionLoading}
                          >
                            Bác bỏ báo cáo
                          </Button>
                        </>
                      )}
                      {selectedReport.status !== "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs"
                          onClick={() => handleUpdateStatus(selectedReport._id, "pending")}
                          disabled={actionLoading}
                        >
                          Đưa về trạng thái Chờ xử lý
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Reported Post Information */}
              <div className="p-6 flex flex-col gap-5 bg-muted/10">
                <h3 className="text-sm font-bold tracking-tight text-primary flex items-center gap-1.5 border-b pb-2">
                  <FileText className="size-4" />
                  BÀI VIẾT BỊ BÁO CÁO
                </h3>

                {selectedReport.post ? (
                  <>
                    {/* Post Author Card */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Người đăng bài</h4>
                      <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                        <Avatar className="size-10 border border-border">
                          <AvatarImage
                            src={selectedReport.post.user?.profile_picture}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-xs font-bold">
                            {getInitials(selectedReport.post.user?.full_name || selectedReport.post.user?.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm text-foreground truncate">
                            {selectedReport.post.user?.full_name || "Chưa thiết lập"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            @{selectedReport.post.user?.username}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                            <Mail className="size-3 shrink-0" />
                            {selectedReport.post.user?.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Post Details & Content */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center bg-muted/50 p-2.5 rounded-lg border">
                        <span className="text-xs font-semibold text-muted-foreground">Trạng thái bài viết:</span>
                        <div>{renderPostStatusBadge(selectedReport.post)}</div>
                      </div>

                      <div className="p-4 bg-background rounded-lg border leading-relaxed shadow-2xs">
                        <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center gap-1">
                          <Clock className="size-3" />
                          Đăng ngày {formatDate(selectedReport.post.createdAt)}
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-line break-words">
                          {selectedReport.post.content || <span className="italic text-muted-foreground">(Không có nội dung văn bản)</span>}
                        </p>
                        
                        {/* Post Media Grid */}
                        {selectedReport.post.image_urls && selectedReport.post.image_urls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-3.5 border-t pt-3 border-dashed">
                            {selectedReport.post.image_urls.map((imgUrl, i) => (
                              <img
                                key={i}
                                src={imgUrl}
                                alt={`Ảnh bài viết ${i + 1}`}
                                className="w-full aspect-square object-cover rounded-lg border shadow-3xs"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick moderation buttons */}
                    <div className="mt-auto pt-4 border-t border-dashed">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Hành động kiểm duyệt bài viết</h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* Toggle Lock */}
                        <Button
                          size="sm"
                          variant={selectedReport.post.isActive ? "outline" : "default"}
                          onClick={() => handleTogglePostActive(selectedReport.post)}
                          disabled={actionLoading}
                          className="flex-1 text-xs gap-1.5 h-8.5 font-semibold"
                        >
                          <Ban className="size-3.5" />
                          {selectedReport.post.isActive ? "Khóa bài viết" : "Mở khóa bài viết"}
                        </Button>

                        {/* Toggle Soft Delete */}
                        <Button
                          size="sm"
                          variant={selectedReport.post.isDelete ? "default" : "outline"}
                          onClick={() => handleTogglePostDelete(selectedReport.post)}
                          disabled={actionLoading}
                          className={`flex-1 text-xs gap-1.5 h-8.5 font-semibold ${
                            !selectedReport.post.isDelete
                              ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:hover:bg-rose-950/20"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          <Trash2 className="size-3.5" />
                          {selectedReport.post.isDelete ? "Khôi phục bài viết" : "Xóa bài viết"}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-amber-500/5 rounded-lg border border-amber-500/20 text-center my-auto">
                    <AlertTriangle className="size-8 text-amber-500 mb-2" />
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                      Bài viết gốc không tồn tại
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                      Bài viết bị báo cáo này đã được xóa hoàn toàn khỏi hệ thống database.
                    </p>
                  </div>
                )}

              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-muted/20">
              <Button
                variant="outline"
                onClick={() => setIsDetailOpen(false)}
                className="w-full sm:w-auto h-9 font-medium"
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default ReportPostManagement;
