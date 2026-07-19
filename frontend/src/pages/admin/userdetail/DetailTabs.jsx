import React from "react";
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
  ShieldAlert
} from "lucide-react";

const DetailTabs = ({
  user,
  posts,
  conversations,
  reports,
  formatDate,
  detailTab,
  setDetailTab,
}) => {
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
      </CardContent>
    </Card>
  );
};

export default DetailTabs;
