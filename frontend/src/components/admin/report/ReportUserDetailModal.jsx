import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  Mail,
  FileText,
  Clock,
  Ban,
  ShieldCheck,
  XCircle,
  HelpCircle,
  User,
  Heart,
  MessageCircle,
  Activity,
  Share2,
  MessageSquare,
} from "lucide-react";
import { getPostsByIdUser } from "../../../services/PostServices";
import {
  getReportConversation,
  getReportUser,
  getReportPost,
  getReportComment,
} from "../../../services/admin/ReportService";

const ReportUserDetailModal = ({
  isDetailOpen,
  selectedReport,
  setIsDetailOpen,
  actionLoading,
  handleUpdateStatus,
  handleToggleUserActive,
}) => {
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [reportedConvs, setReportedConvs] = useState([]);
  const [convsLoading, setConvsLoading] = useState(false);
  const [userReportStats, setUserReportStats] = useState({
    userReports: 0,
    postReports: 0,
    commentReports: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (selectedReport?.user?._id && isDetailOpen) {
        try {
          setPostsLoading(true);
          setConvsLoading(true);

          // Fetch posts, reported conversations, and other report types in parallel
          const [postsRes, convReportsRes, userReportsRes, postReportsRes, commentReportsRes] = await Promise.all([
            getPostsByIdUser(selectedReport.user._id),
            getReportConversation(),
            getReportUser(selectedReport.user._id),
            getReportPost(),
            getReportComment()
          ]);

          if (postsRes.success) {
            setUserPosts(postsRes.posts || []);
          }

          if (convReportsRes.success && convReportsRes.reportConversations) {
            // Filter conversations where the reported user is a participant or creator
            const filtered = convReportsRes.reportConversations.filter((report) => {
              const conv = report.conversation;
              if (!conv) return false;
              const isParticipant = conv.participants?.some(
                (p) => {
                  const pId = p.userId?._id?.toString() || p.userId?.toString() || p.toString();
                  return pId === selectedReport.user._id.toString();
                }
              );
              const isCreator = conv.group?.createBy?.toString() === selectedReport.user._id.toString();
              return isParticipant || isCreator;
            });
            setReportedConvs(filtered);
          }

          let userReportsCount = 0;
          if (userReportsRes.success && userReportsRes.reportUsers) {
            userReportsCount = userReportsRes.reportUsers.filter(
              (r) => r.targetId?.toString() === selectedReport.user._id.toString()
            ).length;
          }

          let postReportsCount = 0;
          if (postReportsRes.success && postReportsRes.reportPosts) {
            postReportsCount = postReportsRes.reportPosts.filter(
              (r) => (r.post?.user?._id?.toString() || r.post?.user?.toString()) === selectedReport.user._id.toString()
            ).length;
          }

          let commentReportsCount = 0;
          if (commentReportsRes.success && commentReportsRes.reportComments) {
            commentReportsCount = commentReportsRes.reportComments.filter(
              (r) => (r.comment?.user?._id?.toString() || r.comment?.user?.toString()) === selectedReport.user._id.toString()
            ).length;
          }

          setUserReportStats({
            userReports: userReportsCount || 1, // Fallback to 1 (this report)
            postReports: postReportsCount,
            commentReports: commentReportsCount,
          });

        } catch (error) {
          console.error("Lỗi khi tải dữ liệu của user:", error);
        } finally {
          setPostsLoading(false);
          setConvsLoading(false);
        }
      }
    };
    fetchData();
  }, [selectedReport, isDetailOpen]);

  if (!selectedReport) return null;

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

  return (
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="sm:max-w-4xl w-[95vw] rounded-xl p-0 overflow-hidden border border-border shadow-2xl">
        <DialogHeader className="p-5 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                Chi tiết Báo cáo Người dùng
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

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border max-h-[65vh] overflow-y-auto scrollbar-hide">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Left Column: Report Details & Actions */}
          <div className="p-6 flex flex-col gap-5">
            <h3 className="text-sm font-bold tracking-tight text-primary flex items-center gap-1.5 border-b pb-2">
              <AlertTriangle className="size-4" />
              NỘI DUNG BÁO CÁO
            </h3>

            {/* Reporter Card */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Người báo cáo
              </h4>
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                <Avatar className="size-10 border border-border">
                  <AvatarImage
                    src={selectedReport.reporterId?.profile_picture}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {getInitials(
                      selectedReport.reporterId?.full_name ||
                        selectedReport.reporterId?.username,
                    )}
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
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Lý do báo cáo
                </h4>
                <p className="text-sm font-semibold text-foreground bg-amber-500/5 text-amber-800 dark:text-amber-300 px-3 py-2 rounded-md border border-amber-500/10">
                  {selectedReport.reason}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1 font-medium">
                  Chi tiết mô tả
                </h4>
                <p className="text-sm text-foreground/80 bg-muted/30 px-3 py-2 rounded-md border whitespace-pre-line leading-relaxed">
                  {selectedReport.details ||
                    "(Không có mô tả chi tiết từ người báo cáo)"}
                </p>
              </div>
            </div>

            {/* Proof Attachment */}
            {selectedReport.file && selectedReport.file.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Ảnh bằng chứng đính kèm
                </h4>
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
                        <span className="text-white text-[11px] font-medium px-2 py-1 rounded bg-black/60">
                          Xem ảnh lớn
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Report Status Handle */}
            <div className="pt-4 border-t border-dashed mt-auto">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Trạng thái báo cáo hiện tại
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="shrink-0">
                  {renderStatusBadge(selectedReport.status)}
                </div>

                <div className="flex gap-2 flex-1 w-full">
                  {selectedReport.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs font-semibold cursor-pointer"
                        onClick={() =>
                          handleUpdateStatus(selectedReport._id, "resolved")
                        }
                        disabled={actionLoading}
                      >
                        Giải quyết
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:hover:bg-rose-900/20 cursor-pointer"
                        onClick={() =>
                          handleUpdateStatus(selectedReport._id, "dismissed")
                        }
                        disabled={actionLoading}
                      >
                        Bác bỏ
                      </Button>
                    </>
                  )}
                  {selectedReport.status !== "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs cursor-pointer"
                      onClick={() =>
                        handleUpdateStatus(selectedReport._id, "pending")
                      }
                      disabled={actionLoading}
                    >
                      Đưa về Chờ xử lý
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Reported User Card & Posts */}
          <div className="p-6 flex flex-col gap-5 bg-muted/10">
            <h3 className="text-sm font-bold tracking-tight text-primary flex items-center gap-1.5 border-b pb-2">
              <User className="size-4" />
              NGƯỜI DÙNG BỊ BÁO CÁO
            </h3>

            {selectedReport.user ? (
              <>
                {/* User Info Card */}
                <div className="flex items-center justify-between gap-3 p-3 bg-muted/40 rounded-lg border bg-background">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-12 border border-border">
                      <AvatarImage
                        src={selectedReport.user.profile_picture}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-rose-500/10 text-rose-500 text-xs font-bold">
                        {getInitials(
                          selectedReport.user.full_name ||
                            selectedReport.user.username,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-foreground truncate">
                        {selectedReport.user.full_name || "Chưa thiết lập"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        @{selectedReport.user.username}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <Mail className="size-3 shrink-0" />
                        {selectedReport.user.email}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="xs"
                    variant={
                      selectedReport.user.isActive !== false
                        ? "outline"
                        : "default"
                    }
                    className={`h-8 px-3 text-[10px] font-semibold cursor-pointer shrink-0 ${
                      selectedReport.user.isActive !== false
                        ? "text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                    onClick={() => handleToggleUserActive(selectedReport.user)}
                    disabled={actionLoading}
                  >
                    <Ban className="size-3 mr-1" />
                    {selectedReport.user.isActive !== false
                      ? "Khóa tài khoản"
                      : "Mở tài khoản"}
                  </Button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-border mt-4 mb-3">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                      activeTab === "posts"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Bài viết ({userPosts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("conversations")}
                    className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                      activeTab === "conversations"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Hộp thoại
                  </button>
                  <button
                    onClick={() => setActiveTab("stats")}
                    className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                      activeTab === "stats"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Thống kê
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 flex flex-col min-h-0">
                  {activeTab === "posts" && (
                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[35vh] scrollbar-hide">
                      {postsLoading ? (
                        <div className="text-center py-6 text-xs text-muted-foreground">
                          Đang tải danh sách bài viết...
                        </div>
                      ) : userPosts.length === 0 ? (
                        <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg bg-background/50">
                          Người dùng chưa đăng tải bài viết nào.
                        </div>
                      ) : (
                        userPosts.map((post) => (
                          <div
                            key={post._id}
                            className="p-3 bg-background rounded-lg border flex flex-col gap-2 shadow-2xs hover:shadow-xs transition-shadow text-left"
                          >
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>{formatDate(post.createdAt)}</span>
                              <span className="font-semibold px-1.5 py-0.5 bg-muted rounded">
                                {post.isActive !== false ? (
                                  <span className="text-emerald-600">Active</span>
                                ) : (
                                  <span className="text-rose-600">Locked</span>
                                )}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/80 line-clamp-3 leading-normal break-words whitespace-pre-wrap">
                              {post.content || (
                                <span className="italic text-muted-foreground">
                                  (Không có nội dung chữ)
                                </span>
                              )}
                            </p>
                            {post.image_urls && post.image_urls.length > 0 && (
                              <div className="grid grid-cols-3 gap-1 mt-1">
                                {post.image_urls.slice(0, 3).map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt="Post media"
                                    className="w-full aspect-square object-cover rounded-md border"
                                  />
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1 border-t border-dashed mt-1">
                              <span className="flex items-center gap-1" title="Lượt thích">
                                <Heart className="size-3 text-rose-500" />
                                {post.likes_count?.length || 0}
                              </span>
                              <span className="flex items-center gap-1" title="Bình luận">
                                <MessageSquare className="size-3 text-blue-500" />
                                {post.comments_count || 0}
                              </span>
                              <span className="flex items-center gap-1" title="Chia sẻ">
                                <Share2 className="size-3 text-emerald-500" />
                                {post.shares_count || 0}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "conversations" && (
                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[35vh] scrollbar-hide">
                      {convsLoading ? (
                        <div className="text-center py-6 text-xs text-muted-foreground">
                          Đang tải danh sách hộp thoại...
                        </div>
                      ) : reportedConvs.length === 0 ? (
                        <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg bg-background/50 text-left p-4">
                          <p className="font-semibold text-foreground mb-1">Không có hộp thoại vi phạm</p>
                          <p className="text-[11px] leading-normal text-muted-foreground">Chưa có cuộc hội thoại hoặc nhóm chat nào liên quan đến người dùng này bị báo cáo.</p>
                        </div>
                      ) : (
                        reportedConvs.map((report) => {
                          const conv = report.conversation;
                          return (
                            <div
                              key={report._id}
                              className="p-3 bg-background rounded-lg border flex flex-col gap-2 shadow-2xs hover:shadow-xs transition-shadow text-left"
                            >
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span className="font-semibold text-primary">#{report._id.toUpperCase()}</span>
                                <span>{formatDate(report.createdAt)}</span>
                              </div>
                              <p className="text-xs font-bold text-foreground">
                                {conv?.full_name || conv?.group?.name || "Hộp thoại nhóm"}
                              </p>
                              <div className="text-[10px] text-amber-700 bg-amber-500/5 p-1.5 rounded border border-amber-500/10">
                                Lý do báo cáo: {report.reason}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {activeTab === "stats" && (
                    <div className="space-y-4 text-left">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-background border rounded-lg shadow-2xs">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng số Bài viết</p>
                          <p className="text-lg font-bold mt-0.5 text-primary">{userPosts.length}</p>
                        </div>
                        <div className="p-3 bg-background border rounded-lg shadow-2xs">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lượt Thích Nhận được</p>
                          <p className="text-lg font-bold mt-0.5 text-rose-600">
                            {userPosts.reduce((acc, p) => acc + (p.likes_count?.length || 0), 0)}
                          </p>
                        </div>
                        <div className="p-3 bg-background border rounded-lg shadow-2xs">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lượt chia sẻ bài viết</p>
                          <p className="text-lg font-bold mt-0.5 text-emerald-600">
                            {userPosts.reduce((acc, p) => acc + (p.shares_count || 0), 0)}
                          </p>
                        </div>
                        <div className="p-3 bg-background border rounded-lg shadow-2xs">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Báo cáo Tài khoản</p>
                          <p className="text-lg font-bold mt-0.5 text-amber-600">
                            {userReportStats.userReports} lần
                          </p>
                        </div>
                        <div className="p-3 bg-background border rounded-lg shadow-2xs">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Báo cáo Bài viết</p>
                          <p className="text-lg font-bold mt-0.5 text-amber-650">
                            {userReportStats.postReports} lần
                          </p>
                        </div>
                        <div className="p-3 bg-background border rounded-lg shadow-2xs">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Báo cáo Bình luận</p>
                          <p className="text-lg font-bold mt-0.5 text-amber-650">
                            {userReportStats.commentReports} lần
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 leading-normal flex items-start gap-2">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-0.5">Lưu ý kiểm duyệt</p>
                          Admin nên đối chiếu thông tin bài viết, lịch sử hoạt động và các báo cáo khác của người dùng này để đưa ra quyết định xử lý phù hợp nhất.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Không thể tải thông tin đối tượng bị báo cáo
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportUserDetailModal;
