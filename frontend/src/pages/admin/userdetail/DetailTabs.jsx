import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  Share2, 
  MessageSquare, 
  Check, 
  Info, 
  FileText, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  ShieldAlert,
  History,
  LogIn,
  LogOut,
  FilePlus,
  FileCode,
  Trash2,
  HeartOff,
  Globe,
  Monitor
} from "lucide-react";
import { getUserLogs } from "../../../services/admin/UserService";


const DetailTabs = ({
  user,
  posts,
  conversations,
  reports,
  formatDate,
  detailTab,
  setDetailTab,
}) => {
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

  const fetchLogs = async (page = 1, filter = "all") => {
    setLogsLoading(true);
    try {
      const data = await getUserLogs(user._id, page, 10, filter);
      if (data.success) {
        setLogs(data.logs);
        setLogsPage(data.pagination.currentPage);
        setLogsTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Lỗi khi lấy nhật ký hoạt động:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (detailTab === "logs") {
      fetchLogs(logsPage, logsFilter);
    }
  }, [detailTab, logsPage, logsFilter]);

  const handleFilterChange = (e) => {
    setLogsFilter(e.target.value);
    setLogsPage(1);
  };

  // Calculate account age in days
  const getAccountAge = (dateString) => {

    if (!dateString) return 0;
    const diffTime = Math.abs(new Date() - new Date(dateString));
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const accountAgeDays = getAccountAge(user.createdAt);

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
    <Card className="border-border shadow-md flex-1 bg-card overflow-hidden">
      {/* Premium Tab Bar Header */}
      <CardHeader className="p-0 border-b border-border/80 bg-muted/20">
        <div className="flex px-4 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Tổng quan", icon: Info },
            { id: "posts", label: `Bài viết (${posts.length})`, icon: FileText },
            { id: "conversations", label: `Hộp thoại (${conversations.length})`, icon: MessageSquare },
            { id: "reports", label: `Bị báo cáo (${reports.length})`, icon: AlertTriangle },
            { id: "logs", label: "Nhật ký hoạt động", icon: History },
          ].map((tab) => {

            const TabIcon = tab.icon;
            const isActive = detailTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDetailTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 -mb-[1px] transition-all duration-200 shrink-0 ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <TabIcon className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground/80"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Tab content 1: Overview */}
        {detailTab === "overview" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock className="size-4 text-violet-500" /> Thống kê hoạt động chung
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-colors">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cập nhật lần cuối</h4>
                  <p className="text-sm font-bold text-foreground">{formatDate(user.updatedAt)}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-colors">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tuổi đời tài khoản</h4>
                  <p className="text-sm font-bold text-foreground">{accountAgeDays} ngày (từ lúc tạo)</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-colors sm:col-span-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mã định danh (User ID)</h4>
                  <code className="text-xs bg-muted/80 p-1.5 rounded font-mono block select-all w-fit text-foreground mt-1 border border-border/40">
                    {user._id}
                  </code>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-5">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" /> Trạng thái & Bảo mật
              </h3>
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Xác thực vai trò</span>
                  <span className="font-semibold text-foreground capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Trạng thái tài khoản</span>
                  <span className={`font-semibold ${user.isActive ? "text-emerald-500" : "text-rose-500"}`}>
                    {user.isActive ? "Bình thường / Hoạt động" : "Bị vô hiệu hóa / Khóa"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Số lượng cảnh cáo tích lũy</span>
                  <span className={`font-bold ${reports.length > 2 ? "text-rose-500" : "text-foreground"}`}>
                    {reports.length} lần bị báo cáo
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab content 2: Posts */}
        {detailTab === "posts" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                Người dùng này chưa đăng bài viết nào trên hệ thống.
              </div>
            ) : (
              <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-1">
                {posts.map((post) => (
                  <div key={post._id} className="p-4 rounded-xl border border-border/60 bg-muted/25 hover:bg-muted/40 hover:border-border transition-all duration-300">
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed">{post.content || "Nội dung chỉ đính kèm hình ảnh"}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0 font-medium">{formatDate(post.createdAt)}</span>
                    </div>

                    {/* Attachment images */}
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.image_urls.map((img, idx) => (
                          <div key={idx} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border/65">
                            <img 
                              src={img} 
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" 
                              alt="post attachment" 
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4 mt-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
                      <span className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                        <Heart className="size-3 text-rose-500 shrink-0" /> 
                        <strong>{post.likes_count?.length || 0}</strong> lượt thích
                      </span>
                      <span className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <Share2 className="size-3 text-blue-500 shrink-0" /> 
                        <strong>{post.shares_count || 0}</strong> lượt chia sẻ
                      </span>
                      <span className="ml-auto font-bold uppercase text-[10px] tracking-wider">
                        {post.isActive ? (
                          <span className="text-emerald-600 dark:text-emerald-400">Đang hiển thị</span>
                        ) : (
                          <span className="text-rose-500">Bị ẩn</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab content 3: Conversations */}
        {detailTab === "conversations" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {conversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                Người dùng chưa bắt đầu bất cứ cuộc trò chuyện nào.
              </div>
            ) : (
              <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-1">
                {conversations.map((conv) => {
                  const isGroup = conv.type === "group";
                  
                  // Filter out active user to find direct partner
                  const otherParticipants = conv.participants
                    .filter((p) => p.userId && p.userId._id !== user._id);

                  const chatName = isGroup
                    ? conv.group?.name || "Nhóm chưa đặt tên"
                    : otherParticipants.map((p) => p.userId?.full_name || p.userId?.username).join(", ") || "Hội thoại cá nhân";

                  return (
                    <div 
                      key={conv._id} 
                      className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-all duration-300 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Overlapping Avatar Stacks */}
                        <div className="flex -space-x-3 shrink-0">
                          {conv.participants.slice(0, 3).map((p, pIdx) => (
                            <Avatar key={pIdx} className="size-8 border-2 border-background ring-1 ring-border shadow-xs">
                              <AvatarImage src={p.userId?.profile_picture} className="object-cover" />
                              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                                {getInitials(p.userId?.full_name || p.userId?.username || "U")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {conv.participants.length > 3 && (
                            <div className="size-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground ring-1 ring-border shrink-0 shadow-xs">
                              +{conv.participants.length - 3}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-foreground truncate max-w-[280px]">
                            {chatName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isGroup ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                            }`}>
                              {isGroup ? "Nhóm" : "Trực tiếp"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {conv.participants.length} thành viên
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {conv.lastMessageAt && (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Lần cuối</span>
                          <span className="text-[11px] font-bold text-foreground">{formatDate(conv.lastMessageAt)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab content 4: Reports */}
        {detailTab === "reports" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                  <Check className="size-7" />
                </div>
                <div>
                  <p className="font-bold text-sm">Tài khoản này hoàn toàn trong sạch</p>
                  <p className="text-xs text-muted-foreground mt-1">Không có bất kỳ báo cáo vi phạm nào chống lại người dùng này.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-1">
                {reports.map((rep) => (
                  <div 
                    key={rep._id} 
                    className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/10 space-y-3 relative hover:border-rose-500/40 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          {rep.reason}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-semibold">{formatDate(rep.createdAt)}</span>
                    </div>

                    <p className="text-xs text-foreground/80 leading-relaxed bg-background/50 p-3 rounded-lg border border-border/40 whitespace-pre-wrap">
                      {rep.details || "Không có nội dung mô tả chi tiết."}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3 mt-2 font-medium">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="size-5 border">
                          <AvatarImage src={rep.reporterId?.profile_picture} className="object-cover" />
                          <AvatarFallback className="text-[8px] font-bold">
                            {getInitials(rep.reporterId?.full_name || rep.reporterId?.username || "R")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-foreground font-semibold text-[11px]">
                          Bởi {rep.reporterId?.full_name || `@${rep.reporterId?.username}`}
                        </span>
                      </div>

                      <span className="uppercase text-[10px] font-bold tracking-wider">
                        {rep.status === "pending" && <span className="text-amber-500">Chưa xử lý</span>}
                        {rep.status === "resolved" && <span className="text-emerald-500">Đã xử lý</span>}
                        {rep.status === "dismissed" && <span className="text-slate-500">Đã bác bỏ</span>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab content 5: Activity Logs */}
        {detailTab === "logs" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Filter Header */}
            <div className="flex items-center justify-between border-b pb-4 border-border/60">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <History className="size-4 text-primary" /> Lịch sử hoạt động của tài khoản
              </h3>
              <select
                value={logsFilter}
                onChange={handleFilterChange}
                className="bg-background text-foreground text-xs font-semibold px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
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

            {logsLoading ? (
              <div className="flex justify-center py-12 text-sm text-muted-foreground font-medium animate-pulse">
                Đang tải nhật ký hoạt động...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                Không tìm thấy nhật ký hoạt động nào phù hợp.
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-border/80 space-y-8 py-2">
                {logs.map((log) => {
                  const mapped = actionMap[log.action] || { label: log.action, color: "text-slate-500 bg-slate-500/10 border-slate-500/20" };
                  
                  let LogIcon = Info;
                  if (log.action === "LOGIN") LogIcon = LogIn;
                  else if (log.action === "LOGOUT") LogIcon = LogOut;
                  else if (log.action === "CREATE_POST" || log.action === "SHARE_POST") LogIcon = FilePlus;
                  else if (log.action === "UPDATE_POST" || log.action === "UPDATE_PROFILE") LogIcon = FileCode;
                  else if (log.action === "DELETE_POST" || log.action === "DELETE_COMMENT") LogIcon = Trash2;
                  else if (log.action === "LIKE_POST") LogIcon = Heart;
                  else if (log.action === "UNLIKE_POST") LogIcon = HeartOff;
                  else if (log.action === "CREATE_COMMENT") LogIcon = MessageSquare;
                  else if (log.action === "SEND_MESSAGE") LogIcon = ArrowRight;
                  else if (log.action === "LOCK_ACCOUNT" || log.action === "DEMOTE_USER") LogIcon = ShieldAlert;
                  else if (log.action === "UNLOCK_ACCOUNT" || log.action === "PROMOTE_ADMIN") LogIcon = Check;

                  return (
                    <div key={log._id} className="relative group animate-in fade-in duration-300">
                      <span className={`absolute -left-[38px] top-0 rounded-full border-2 p-1.5 bg-background flex items-center justify-center transition-all group-hover:scale-115 ${mapped.color}`}>
                        <LogIcon className="size-3.5" />
                      </span>

                      <div className="p-4 rounded-xl border border-border/50 bg-muted/20 group-hover:bg-muted/30 group-hover:border-border transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="font-bold text-sm text-foreground">
                            {mapped.label}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium shrink-0 flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(log.createdAt).toLocaleString("vi-VN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>

                        {log.details && (log.details.contentSnippet || log.details.updatedFields) && (
                          <div className="mt-2 text-xs text-muted-foreground bg-background/50 p-2.5 rounded-lg border border-border/40 font-medium">
                            {log.details.contentSnippet && (
                              <p className="italic">"{log.details.contentSnippet}"</p>
                            )}
                            {log.details.updatedFields && log.details.updatedFields.length > 0 && (
                              <p>Cập nhật: {log.details.updatedFields.join(", ")}</p>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground/80 border-t border-border/40 pt-2.5 font-medium">
                          {log.ipAddress && (
                            <span className="flex items-center gap-1.5">
                              <Globe className="size-3.5 text-muted-foreground/60" /> IP: {log.ipAddress}
                            </span>
                          )}
                          {log.userAgent && (
                            <span className="flex items-center gap-1.5">
                              <Monitor className="size-3.5 text-muted-foreground/60" /> {parseUserAgent(log.userAgent)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {logsTotalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6 border-t border-border/60 pt-4">
                <button
                  onClick={() => setLogsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={logsPage === 1}
                  className="px-4 py-2 text-xs font-bold rounded-lg border bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card transition-all cursor-pointer"
                >
                  Trang trước
                </button>
                <span className="text-xs font-semibold text-muted-foreground">
                  Trang {logsPage} / {logsTotalPages}
                </span>
                <button
                  onClick={() => setLogsPage((prev) => Math.min(prev + 1, logsTotalPages))}
                  disabled={logsPage === logsTotalPages}
                  className="px-4 py-2 text-xs font-bold rounded-lg border bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card transition-all cursor-pointer"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailTabs;

