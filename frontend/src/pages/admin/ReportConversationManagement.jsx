import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getReportConversation,
  updateReportStatus,
} from "../../services/admin/ReportService";
import {
  toggleConversationActive,
  toggleConversationDelete,
} from "../../services/admin/MessageService";
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
import ReportConversationDetailModal from "../../components/admin/report/ReportConversationDetailModal";
import {
  Search,
  RefreshCw,
  Eye,
  Ban,
  Check,
  Clock,
  UserCheck,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Calendar,
} from "lucide-react";

const ReportConversationManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [reporterFilter, setReporterFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
    limit: 10,
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0,
  });

  const [selectedReport, setSelectedReport] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReportConversation(
        searchQuery,
        statusFilter,
        startDate,
        endDate,
        currentPage,
        reasonFilter,
        reporterFilter
      );
      if (res.success) {
        setReports(res.reportConversations || []);
        setPagination(res.pagination || { currentPage: 1, totalPages: 1, totalReports: 0, limit: 10 });
        setStats(res.stats || { total: 0, pending: 0, resolved: 0, dismissed: 0 });
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách báo cáo hộp thoại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter, reasonFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReports();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setReasonFilter("all");
    setReporterFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const res = await updateReportStatus(reportId, newStatus);
      if (res.success) {
        toast.success(`Cập nhật trạng thái báo cáo thành công!`);
        fetchReports();
        if (selectedReport && selectedReport._id === reportId) {
          setSelectedReport((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái báo cáo");
    }
  };

  const handleToggleActive = async (convId) => {
    try {
      const res = await toggleConversationActive(convId);
      if (res.success) {
        toast.success(res.message || "Đã thay đổi trạng thái hoạt động nhóm!");
        fetchReports();
        if (selectedReport && selectedReport.conversation?._id === convId) {
          setSelectedReport((prev) => ({
            ...prev,
            conversation: { ...prev.conversation, isActive: !prev.conversation.isActive },
          }));
        }
      }
    } catch (err) {
      toast.error("Không thể thay đổi trạng thái nhóm");
    }
  };

  const handleToggleDelete = async (convId) => {
    try {
      const res = await toggleConversationDelete(convId);
      if (res.success) {
        toast.success(res.message || "Đã thay đổi trạng thái xóa nhóm!");
        fetchReports();
        if (selectedReport && selectedReport.conversation?._id === convId) {
          setSelectedReport((prev) => ({
            ...prev,
            conversation: { ...prev.conversation, isDelete: !prev.conversation.isDelete },
          }));
        }
      }
    } catch (err) {
      toast.error("Không thể thay đổi trạng thái xóa nhóm");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý báo cáo Hộp thoại / Nhóm</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem và giải quyết các báo cáo vi phạm tiêu chuẩn cộng đồng đối với các cuộc hội thoại nhóm.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Tổng số báo cáo</p>
              <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
            </div>
            <div className="size-10 bg-indigo-500/5 rounded-lg flex items-center justify-center text-indigo-500">
              <AlertTriangle className="size-5" />
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

      {/* Filter Options */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo ID Báo cáo hoặc tên nhóm..."
                  className="pl-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Người báo cáo (tên/username)..."
                  className="pl-9 text-xs"
                  value={reporterFilter}
                  onChange={(e) => setReporterFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Trạng thái báo cáo</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border rounded-md text-xs bg-slate-50 dark:bg-zinc-900 outline-none"
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="resolved">Đã giải quyết</option>
                  <option value="dismissed">Đã bác bỏ</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Lý do báo cáo</span>
                <select
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value)}
                  className="p-2 border rounded-md text-xs bg-slate-50 dark:bg-zinc-900 outline-none"
                >
                  <option value="all">Tất cả lý do</option>
                  <option value="Spam / Harassment">Spam / Harassment</option>
                  <option value="Sensitive content / Nudity">Sensitive content / Nudity</option>
                  <option value="Abuse / Threat">Abuse / Threat</option>
                  <option value="Fraud / Impersonation">Fraud / Impersonation</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-4 ml-auto">
                <Button type="submit" size="sm" className="text-xs h-8 cursor-pointer">
                  <RefreshCw className="size-3.5 mr-1" />
                  Tìm kiếm
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleClearFilters} className="text-xs h-8 cursor-pointer">
                  <RotateCcw className="size-3.5 mr-1" />
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="shadow-xs border-border overflow-hidden">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Danh sách báo cáo</CardTitle>
            <span className="text-xs text-muted-foreground">
              Hiển thị {reports.length} kết quả
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[100px] pl-4 py-3">Mã báo cáo</TableHead>
                  <TableHead className="w-[150px]">Người báo cáo</TableHead>
                  <TableHead className="w-[180px]">Nhóm bị báo cáo</TableHead>
                  <TableHead className="w-[150px]">Lý do</TableHead>
                  <TableHead className="w-[120px]">Ngày gửi</TableHead>
                  <TableHead className="w-[100px]">Trạng thái BC</TableHead>
                  <TableHead className="w-[100px]">Trạng thái Nhóm</TableHead>
                  <TableHead className="w-[80px] text-center pr-4">Hành động</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-4 py-4"><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-8 w-8 rounded-full inline-block" /></TableCell>
                    </TableRow>
                  ))
                ) : reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report._id} className="hover:bg-muted/10">
                      <TableCell className="font-mono text-[10px] pl-4 py-3 text-slate-500">
                        {report._id.substring(report._id.length - 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarImage src={report.reporterId?.profile_picture} />
                            <AvatarFallback>{report.reporterId?.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate leading-tight">
                              {report.reporterId?.full_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate leading-none">
                              @{report.reporterId?.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7 rounded-lg">
                            <AvatarImage src={report.conversation?.group?.imageGroup || "/default-avatar.avif"} className="rounded-lg object-cover" />
                            <AvatarFallback className="rounded-lg">G</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">
                              {report.conversation?.group?.name || "Hộp thoại"}
                            </p>
                            <p className="text-[10px] text-slate-400 capitalize">
                              {report.conversation?.type}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {report.reason}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none ${
                            report.status === "pending"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-500"
                              : report.status === "resolved"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-500"
                                : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {report.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none ${
                            report.conversation?.isActive === false
                              ? "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-500"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-500"
                          }`}
                        >
                          {report.conversation?.isActive === false ? "Blocked" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center pr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedReport(report);
                            setDetailModalOpen(true);
                          }}
                          className="size-7 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800"
                        >
                          <Eye className="size-4 text-slate-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                      Không tìm thấy báo cáo nào phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/80">
              <span className="text-xs text-muted-foreground">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="text-xs h-8 cursor-pointer"
                >
                  <ChevronLeft className="size-3.5 mr-1" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="text-xs h-8 cursor-pointer"
                >
                  Tiếp
                  <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <ReportConversationDetailModal
        isDetailOpen={detailModalOpen}
        setIsDetailOpen={setDetailModalOpen}
        selectedReport={selectedReport}
        handleUpdateStatus={handleUpdateStatus}
        handleToggleActive={handleToggleActive}
        handleToggleDelete={handleToggleDelete}
      />
    </div>
  );
};

export default ReportConversationManagement;
