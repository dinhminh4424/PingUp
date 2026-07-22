import React, { useEffect, useState } from "react";
import { getUsers, getUserLogs } from "../../../services/admin/UserService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  History,
  Clock,
  Globe,
  Monitor,
  Check,
  ShieldAlert,
  LogIn,
  LogOut,
  FilePlus,
  FileCode,
  Trash2,
  Heart,
  HeartOff,
  MessageSquare,
  ArrowRight,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

const ActivityLogUserSearch = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Modal Logs state
  const [selectedUser, setSelectedUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsFilter, setLogsFilter] = useState("all");

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
    DEMOTE_USER: { label: "Hạ quyền xuống User thường", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
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
    return <LogIcon className="size-3.5" />;
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
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getUsers(debouncedSearchQuery, "all", "all", 1);
      if (result.success) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearchQuery]);

  const fetchUserLogs = async (userId, page = 1, filter = "all") => {
    setLogsLoading(true);
    try {
      const data = await getUserLogs(userId, page, 10, filter);
      if (data.success) {
        setLogs(data.logs);
        setLogsPage(data.pagination.currentPage);
        setLogsTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      toast.error("Lỗi khi tải lịch sử hoạt động của người dùng!");
      console.error(error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchUserLogs(selectedUser._id, logsPage, logsFilter);
    }
  }, [selectedUser, logsPage, logsFilter]);

  const handleOpenLogs = (user) => {
    setSelectedUser(user);
    setLogs([]);
    setLogsPage(1);
    setLogsFilter("all");
  };

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search Bar */}
      <div className="relative w-full max-w-lg mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Nhập tên, email hoặc username để tìm người dùng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11 w-full bg-card shadow-xs text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-sm text-muted-foreground font-semibold animate-pulse">
          Đang tìm kiếm người dùng...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm font-medium">
          Không tìm thấy người dùng nào phù hợp.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {users.map((user) => (
            <Card key={user._id} className="border-border bg-card shadow-xs hover:shadow-md hover:border-border transition-all duration-300 flex flex-col justify-between">
              <CardContent className="p-4 flex flex-col items-center gap-4 text-center">
                <Avatar className="size-16 border-2 border-background ring-1 ring-border shadow-xs">
                  <AvatarImage src={user.profile_picture} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-base font-bold">
                    {getInitials(user.full_name || user.username)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground truncate max-w-[200px]">{user.full_name || user.username}</h4>
                  <p className="text-xs text-muted-foreground truncate max-w-[220px] font-semibold">{user.email}</p>
                  
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      user.role === "admin" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                    }`}>
                      {user.role}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      user.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    }`}>
                      {user.isActive ? "Active" : "Locked"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <div className="border-t border-border/60 p-3 bg-muted/10 rounded-b-xl">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 cursor-pointer font-bold text-xs"
                  onClick={() => handleOpenLogs(user)}
                >
                  <History className="size-3.5" /> Xem nhật ký hoạt động
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* shadcn Dialog Modal to show user logs */}
      <Dialog open={selectedUser !== null} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-6 bg-card text-foreground border border-border rounded-xl">
          <DialogHeader className="border-b pb-4 shrink-0">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <History className="size-5 text-primary" /> Nhật ký hoạt động: {selectedUser?.full_name || selectedUser?.username}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-semibold">
              Địa chỉ email: {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {/* Action Filter & Content container */}
          <div className="flex-1 flex flex-col min-h-0 gap-4 mt-4">
            <div className="flex justify-between items-center shrink-0 border-b border-border/40 pb-2">
              <span className="text-xs font-semibold text-muted-foreground">Chọn bộ lọc hành động:</span>
              <select
                value={logsFilter}
                onChange={(e) => {
                  setLogsFilter(e.target.value);
                  setLogsPage(1);
                }}
                className="bg-background text-foreground text-xs font-semibold px-2 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="all">Tất cả hoạt động</option>
                <option value="LOGIN">Đăng nhập</option>
                <option value="LOGOUT">Đăng xuất</option>
                <option value="CREATE_POST">Đăng bài viết</option>
                <option value="UPDATE_POST">Cập nhật bài viết</option>
                <option value="DELETE_POST">Xóa bài viết</option>
                <option value="LIKE_POST">Thích bài viết</option>
                <option value="CREATE_COMMENT">Viết bình luận</option>
                <option value="DELETE_COMMENT">Xóa bình luận</option>
                <option value="SEND_MESSAGE">Gửi tin nhắn</option>
                <option value="UPDATE_PROFILE">Cập nhật trang cá nhân</option>
                <option value="LOCK_ACCOUNT">Tài khoản bị khóa</option>
                <option value="UNLOCK_ACCOUNT">Tài khoản được mở</option>
              </select>
            </div>

            {/* Scrollable Timeline */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-[250px] relative">
              {logsLoading ? (
                <div className="flex justify-center items-center py-20 text-xs text-muted-foreground font-semibold animate-pulse">
                  Đang tải nhật ký...
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-20 text-xs text-muted-foreground font-medium">
                  Không tìm thấy nhật ký hoạt động nào phù hợp.
                </div>
              ) : (
                <div className="relative pl-6 border-l border-border/80 space-y-6 py-2 ml-4">
                  {logs.map((log) => {
                    const mapped = actionMap[log.action] || {
                      label: log.action,
                      color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
                    };
                    return (
                      <div key={log._id} className="relative group animate-in fade-in duration-300">
                        <span className={`absolute -left-[38px] top-0 rounded-full border p-1 bg-background flex items-center justify-center ${mapped.color}`}>
                          {getLogIcon(log.action)}
                        </span>

                        <div className="p-3 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all text-xs font-semibold">
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-bold text-foreground text-xs">{mapped.label}</span>
                            <span className="text-[10px] text-muted-foreground/80 font-medium shrink-0 flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(log.createdAt).toLocaleString("vi-VN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>

                          {log.details && (log.details.contentSnippet || log.details.updatedFields) && (
                            <div className="mt-1.5 text-[11px] text-muted-foreground/90 bg-background/40 p-2 rounded border border-border/30 font-medium">
                              {log.details.contentSnippet && <p className="italic">"{log.details.contentSnippet}"</p>}
                              {log.details.updatedFields && log.details.updatedFields.length > 0 && (
                                <p>Cập nhật: {log.details.updatedFields.join(", ")}</p>
                              )}
                            </div>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground/60 border-t border-border/20 pt-2 font-medium">
                            {log.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Globe className="size-3 text-muted-foreground/45" /> IP: {log.ipAddress}
                              </span>
                            )}
                            {log.userAgent && (
                              <span className="flex items-center gap-1">
                                <Monitor className="size-3 text-muted-foreground/45" /> {parseUserAgent(log.userAgent)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Dialog Footer with Pagination */}
          {logsTotalPages > 1 && (
            <div className="border-t border-border/50 pt-4 flex justify-between items-center shrink-0 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={logsPage === 1}
                onClick={() => setLogsPage((prev) => Math.max(prev - 1, 1))}
                className="cursor-pointer font-bold text-xs"
              >
                Trang trước
              </Button>
              <span className="text-xs font-semibold text-muted-foreground">
                Trang {logsPage} / {logsTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={logsPage === logsTotalPages}
                onClick={() => setLogsPage((prev) => Math.min(prev + 1, logsTotalPages))}
                className="cursor-pointer font-bold text-xs"
              >
                Trang sau
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityLogUserSearch;
