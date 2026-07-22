import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  History,
  RefreshCw,
  Search,
  Filter,
  Clock,
  Globe,
  Monitor,
  Check,
  ShieldAlert,
  MessageSquare,
  Heart,
  HeartOff,
  Trash2,
  FileCode,
  FilePlus,
  LogOut,
  LogIn,
  Info,
  BarChart3
} from "lucide-react";
import { getAllLogs } from "../../services/admin/ActivityLogService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Import các tab components mới
import ActivityLogStats from "./activitylog/ActivityLogStats";
import ActivityLogAlerts from "./activitylog/ActivityLogAlerts";
import ActivityLogUserSearch from "./activitylog/ActivityLogUserSearch";

const ActivityLogManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("timeline");

  // State của Tab Dòng sự kiện (Timeline)
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogsCount, setTotalLogsCount] = useState(0);

  const actionMap = {
    LOGIN: { label: "Đăng nhập", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    LOGOUT: { label: "Đăng xuất", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
    CREATE_POST: { label: "Đăng bài viết mới", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    UPDATE_POST: { label: "Cập nhật bài viết", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
    DELETE_POST: { label: "Xóa bài viết", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
    LIKE_POST: { label: "Thích bài viết", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
    UNLIKE_POST: { label: "Bỏ thích bài viết", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
    CREATE_COMMENT: { label: "Viết bình luận mới", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
    DELETE_COMMENT: { label: "Xóa bình luận", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
    SEND_MESSAGE: { label: "Gửi tin nhắn", color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
    UPDATE_PROFILE: { label: "Cập nhật trang cá nhân", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    LOCK_ACCOUNT: { label: "Tài khoản bị khóa bởi Admin", color: "text-red-500 bg-red-500/10 border-red-500/20" },
    UNLOCK_ACCOUNT: { label: "Tài khoản được mở khóa bởi Admin", color: "text-green-500 bg-green-500/10 border-green-500/20" },
    PROMOTE_ADMIN: { label: "Thăng quyền Admin", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
    DEMOTE_USER: { label: "Hạ quyền xuống User", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    SHARE_POST: { label: "Chia sẻ bài viết", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  };

  const getLogIcon = (action) => {
    let LogIcon = Info;
    if (action === "LOGIN") LogIcon = LogIn;
    else if (action === "LOGOUT") LogIcon = LogOut;
    else if (action === "CREATE_POST" || action === "SHARE_POST") LogIcon = FilePlus;
    else if (action === "UPDATE_POST" || action === "UPDATE_PROFILE") LogIcon = FileCode;
    else if (action === "DELETE_POST" || action === "DELETE_COMMENT") LogIcon = Trash2;
    else if (action === "LIKE_POST") LogIcon = Heart;
    else if (action === "UNLIKE_POST") LogIcon = HeartOff;
    else if (action === "CREATE_COMMENT") LogIcon = MessageSquare;
    else if (action === "SEND_MESSAGE") LogIcon = ArrowRight;
    else if (action === "LOCK_ACCOUNT" || action === "DEMOTE_USER") LogIcon = ShieldAlert;
    else if (action === "UNLOCK_ACCOUNT" || action === "PROMOTE_ADMIN") LogIcon = Check;
    return <LogIcon className="size-4 shrink-0" />;
  };

  const parseUserAgent = (ua) => {
    if (!ua) return "Không rõ thiết bị";
    let os = "Thiết bị khác";
    let browser = "Trình duyệt khác";

    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edge")) browser = "Edge";

    return `${browser} on ${os}`;
  };

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await getAllLogs(page, 20, actionFilter, debouncedSearchQuery);
      if (result.success) {
        setLogs(result.logs);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalLogsCount(result.pagination.totalLogs || 0);
        }
      }
    } catch (error) {
      toast.error("Lỗi khi tải nhật ký hoạt động hệ thống!");
      console.error("Lỗi: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "timeline") {
      fetchLogs();
    }
  }, [page, actionFilter, debouncedSearchQuery, activeTab]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="size-6 text-primary" /> Nhật ký hoạt động toàn hệ thống
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi chi tiết lịch sử hoạt động, thời gian, IP và thiết bị của tất cả người dùng trên hệ thống.
          </p>
        </div>
        {activeTab === "timeline" && (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Tải lại dữ liệu
          </Button>
        )}
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-border/80 overflow-x-auto scrollbar-none gap-2">
        {[
          { id: "timeline", label: "Nhật ký kiểm toán (Audit Logs)", icon: History },
          { id: "alerts", label: "Cảnh báo bảo mật", icon: ShieldAlert },
          { id: "search", label: "Tìm kiếm User", icon: Search },
          { id: "stats", label: "Thống kê & Biểu đồ", icon: BarChart3 }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-[1px] transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <TabIcon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Render nội dung các Tab */}
      {activeTab === "timeline" && (
        <>
          {/* Filter Options Card */}
          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full"
                />
              </div>

              {/* Action Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                <Filter className="size-4 text-muted-foreground" />
                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-background text-foreground text-xs font-semibold px-3 py-2 h-10 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer w-full md:w-[220px]"
                >
                  <option value="all">Tất cả hành động kiểm toán</option>
                  <option value="LOGIN">Đăng nhập thành công</option>
                  <option value="LOGIN_FAILED">Đăng nhập thất bại</option>
                  <option value="LOGOUT">Đăng xuất</option>
                  <option value="CREATE_POST">Đăng bài viết</option>
                  <option value="UPDATE_POST">Cập nhật bài viết</option>
                  <option value="DELETE_POST">Xóa bài viết</option>
                  <option value="CREATE_COMMENT">Viết bình luận</option>
                  <option value="DELETE_COMMENT">Xóa bình luận</option>
                  <option value="SEND_MESSAGE">Gửi tin nhắn</option>
                  <option value="UPDATE_PROFILE">Cập nhật trang cá nhân</option>
                  <option value="LOCK_ACCOUNT">Khóa tài khoản</option>
                  <option value="UNLOCK_ACCOUNT">Mở khóa tài khoản</option>
                  <option value="PROMOTE_ADMIN">Thăng quyền Admin</option>
                  <option value="DEMOTE_USER">Hạ quyền User</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table / List Card */}
          <Card className="border-border shadow-md bg-card overflow-hidden">
            <CardHeader className="p-4 border-b border-border/80 bg-muted/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">
                  Tổng số bản ghi: <strong>{totalLogsCount}</strong>
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-20 text-sm text-muted-foreground font-semibold animate-pulse">
                  Đang tải danh sách nhật ký...
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground text-sm font-medium">
                  Không tìm thấy nhật ký hoạt động nào phù hợp.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-4">Người thực hiện</th>
                        <th className="p-4">Hành động</th>
                        <th className="p-4">Chi tiết hoạt động</th>
                        <th className="p-4">IP / Thiết bị</th>
                        <th className="p-4">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {logs.map((log) => {
                        const mapped = actionMap[log.action] || {
                          label: log.action,
                          color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
                        };
                        const user = log.userId || {};

                        return (
                          <tr key={log._id} className="hover:bg-muted/15 transition-colors text-sm">
                            {/* User Column */}
                            <td className="p-4">
                              {log.userId ? (
                                <div
                                  onClick={() => navigate(`/admin/users/${user._id}`)}
                                  className="flex items-center gap-3 cursor-pointer group w-fit"
                                >
                                  <Avatar className="size-9 border group-hover:scale-105 transition-transform">
                                    <AvatarImage src={user.profile_picture} className="object-cover" />
                                    <AvatarFallback className="bg-primary/5 text-primary text-[11px] font-bold">
                                      {getInitials(user.full_name || user.username)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                      {user.full_name || `@${user.username}`}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/60 italic font-medium">Hệ thống</span>
                              )}
                            </td>

                            {/* Action Badge Column */}
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${mapped.color}`}
                              >
                                {getLogIcon(log.action)}
                                {mapped.label}
                              </span>
                            </td>

                            {/* Details Column */}
                            <td className="p-4 max-w-xs md:max-w-sm truncate">
                              {log.details && (log.details.contentSnippet || log.details.updatedFields) ? (
                                <div className="text-xs font-medium">
                                  {log.details.contentSnippet && (
                                    <span className="text-foreground italic">"{log.details.contentSnippet}"</span>
                                  )}
                                  {log.details.updatedFields && log.details.updatedFields.length > 0 && (
                                    <span className="text-muted-foreground block mt-1">
                                      Cập nhật: {log.details.updatedFields.join(", ")}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground/60 text-xs italic font-medium">Nội dung hệ thống</span>
                              )}
                            </td>

                            {/* IP/Browser Column */}
                            <td className="p-4">
                              <div className="flex flex-col gap-1 text-xs font-medium text-muted-foreground/90">
                                {log.ipAddress && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="size-3 text-muted-foreground/50" /> {log.ipAddress}
                                  </span>
                                )}
                                {log.userAgent && (
                                  <span className="flex items-center gap-1">
                                    <Monitor className="size-3 text-muted-foreground/50" /> {parseUserAgent(log.userAgent)}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Time Column */}
                            <td className="p-4 text-xs font-semibold text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="size-3 text-muted-foreground/60" />
                                {new Date(log.createdAt).toLocaleString("vi-VN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 text-xs font-bold rounded-lg border bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card transition-all cursor-pointer"
              >
                Trang trước
              </button>
              <span className="text-xs font-semibold text-muted-foreground">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 text-xs font-bold rounded-lg border bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card transition-all cursor-pointer"
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === "alerts" && <ActivityLogAlerts />}

      {activeTab === "search" && <ActivityLogUserSearch />}

      {activeTab === "stats" && <ActivityLogStats />}
    </div>
  );
};

export default ActivityLogManagement;
