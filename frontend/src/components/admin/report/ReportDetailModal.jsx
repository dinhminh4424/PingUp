import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Trash2,
  ShieldCheck,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { getCommentsByPost } from "../../../services/CommentServices";
import {
  toggleCommentActive,
  toggleCommentDelete,
} from "../../../services/admin/CommentService";

const ReportDetailModal = ({
  isDetailOpen,
  selectedReport,
  setIsDetailOpen,
  actionLoading,
  handleUpdateStatus,
  handleTogglePostActive,
  handleTogglePostDelete,
  handleToggleUserActive,
  handleTogglePostCommentDisabled,
}) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = async (postId) => {
    try {
      setLoadingComments(true);
      const res = await getCommentsByPost(postId);
      if (res.success) {
        setComments(res.comments || []);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách bình luận:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (selectedReport && selectedReport.post && selectedReport.post._id) {
      fetchComments(selectedReport.post._id);
    } else {
      setComments([]);
    }
  }, [selectedReport]);

  const handleToggleCommentActiveLocal = async (commentId) => {
    try {
      const res = await toggleCommentActive(commentId);
      if (res.success) {
        toast.success(res.message);
        if (selectedReport && selectedReport.post) {
          fetchComments(selectedReport.post._id);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khóa bình luận!");
    }
  };

  const handleToggleCommentDeleteLocal = async (commentId) => {
    try {
      const res = await toggleCommentDelete(commentId);
      if (res.success) {
        toast.success(res.message);
        if (selectedReport && selectedReport.post) {
          fetchComments(selectedReport.post._id);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi xóa bình luận!");
    }
  };

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
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="sm:max-w-4xl w-[95vw] rounded-xl p-0 overflow-hidden border border-border shadow-2xl">
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

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border max-h-[65vh] overflow-y-auto scrollbar-hide">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Left Column: Report Information */}
          <div className="p-6 flex flex-col gap-5">
            <h3 className="text-sm font-bold tracking-tight text-primary flex items-center gap-1.5 border-b pb-2">
              <AlertTriangle className="size-4 animate-pulse text-amber-500" />
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
                <p className="text-xs font-semibold text-foreground bg-amber-500/5 text-amber-800 dark:text-amber-300 px-3 py-2 rounded-md border border-amber-500/10">
                  {selectedReport.reason}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1 font-medium">
                  Chi tiết mô tả
                </h4>
                <p className="text-xs text-foreground/80 bg-muted/30 px-3 py-2 rounded-md border whitespace-pre-line leading-relaxed break-words">
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
            <div className="pt-4 border-t border-dashed mt-2">
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

          {/* Right Column: Reported Post Information */}
          <div className="p-6 flex flex-col gap-5 bg-muted/10">
            <h3 className="text-sm font-bold tracking-tight text-primary flex items-center gap-1.5 border-b pb-2">
              <FileText className="size-4" />
              BÀI VIẾT BÌ BÁO CÁO
            </h3>

            {selectedReport.post ? (
              <>
                {/* Post Author Card */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Người đăng bài
                  </h4>
                  <div className="flex items-center justify-between gap-3 p-3 bg-muted/40 rounded-lg border bg-background">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-10 border border-border">
                        <AvatarImage
                          src={selectedReport.post.user?.profile_picture}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-indigo-500/10 text-indigo-500 text-xs font-bold">
                          {getInitials(
                            selectedReport.post.user?.full_name ||
                              selectedReport.post.user?.username,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-foreground truncate">
                          {selectedReport.post.user?.full_name ||
                            "Chưa thiết lập"}
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
                    {selectedReport.post.user && (
                      <Button
                        size="xs"
                        variant={
                          selectedReport.post.user.isActive !== false
                            ? "outline"
                            : "default"
                        }
                        className={`h-7 px-2 text-[10px] font-semibold cursor-pointer shrink-0 ${
                          selectedReport.post.user.isActive !== false
                            ? "text-rose-600 border-rose-200 hover:bg-rose-50"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                        onClick={() =>
                          handleToggleUserActive(selectedReport.post.user)
                        }
                        disabled={actionLoading}
                      >
                        <Ban className="size-3 mr-1" />
                        {selectedReport.post.user.isActive !== false
                          ? "Khóa user"
                          : "Mở user"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Post Details & Content */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-muted/50 p-2.5 rounded-lg border bg-background">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Trạng thái bài viết:
                    </span>
                    <div>{renderPostStatusBadge(selectedReport.post)}</div>
                  </div>

                  <div className="p-4 bg-background rounded-lg border leading-relaxed shadow-2xs">
                    <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center gap-1">
                      <Clock className="size-3" />
                      Đăng ngày {formatDate(selectedReport.post.createdAt)}
                    </p>
                    <p className="text-xs text-foreground whitespace-pre-line break-words leading-relaxed font-medium">
                      {selectedReport.post.content || (
                        <span className="italic text-muted-foreground">
                          (Không có nội dung văn bản)
                        </span>
                      )}
                    </p>

                    {/* Post Media Grid */}
                    {selectedReport.post.image_urls &&
                      selectedReport.post.image_urls.length > 0 && (
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

                {/* Comments List Section */}
                <div className="border-t border-dashed pt-4 mt-1 flex flex-col gap-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                    Bình luận của bài viết ({comments.length})
                  </h4>
                  {loadingComments ? (
                    <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
                      <span className="w-4 h-4 border-2 border-t-primary border-muted rounded-full animate-spin" />
                      <span>Đang tải bình luận...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground py-2 text-center">
                      Bài viết chưa có bình luận nào.
                    </p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 no-scrollbar border rounded-lg p-2.5 bg-background">
                      {comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="text-xs border-b pb-2 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-foreground truncate max-w-[100px]">
                                {comment.user?.full_name ||
                                  comment.user?.username}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                @{comment.user?.username}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Toggle Lock Comment */}
                              <button
                                onClick={() =>
                                  handleToggleCommentActiveLocal(comment._id)
                                }
                                className={`p-1 rounded hover:bg-muted transition cursor-pointer ${
                                  comment.isActive !== false
                                    ? "text-rose-600 hover:text-rose-700"
                                    : "text-emerald-600 hover:text-emerald-700"
                                }`}
                                title={
                                  comment.isActive !== false
                                    ? "Khóa bình luận"
                                    : "Mở khóa bình luận"
                                }
                              >
                                <Ban className="size-3" />
                              </button>
                              {/* Toggle Delete Comment */}
                              <button
                                onClick={() =>
                                  handleToggleCommentDeleteLocal(comment._id)
                                }
                                className={`p-1 rounded hover:bg-muted transition cursor-pointer ${
                                  !comment.isDelete
                                    ? "text-red-500 hover:text-red-700"
                                    : "text-emerald-500 hover:text-emerald-600"
                                }`}
                                title={
                                  !comment.isDelete
                                    ? "Xóa bình luận"
                                    : "Khôi phục bình luận"
                                }
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-muted-foreground break-words leading-normal bg-muted/20 p-1.5 rounded border border-dashed">
                            {comment.content}
                            {comment.isActive === false && (
                              <span className="ml-1.5 text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-100/50 uppercase select-none">
                                Đã khóa
                              </span>
                            )}
                            {comment.isDelete && (
                              <span className="ml-1.5 text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded border border-red-100/50 uppercase select-none">
                                Đã xóa
                              </span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick moderation buttons */}
                <div className="pt-4 border-t border-dashed mt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Hành động kiểm duyệt bài viết
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Toggle Lock */}
                    <Button
                      size="sm"
                      variant={
                        selectedReport.post.isActive ? "outline" : "default"
                      }
                      onClick={() =>
                        handleTogglePostActive(selectedReport.post)
                      }
                      disabled={actionLoading}
                      className="flex-1 text-xs gap-1.5 h-8.5 font-semibold cursor-pointer"
                    >
                      <Ban className="size-3.5" />
                      {selectedReport.post.isActive
                        ? "Khóa bài viết"
                        : "Mở khóa bài viết"}
                    </Button>

                    {/* Toggle Soft Delete */}
                    <Button
                      size="sm"
                      variant={
                        selectedReport.post.isDelete ? "default" : "outline"
                      }
                      onClick={() =>
                        handleTogglePostDelete(selectedReport.post)
                      }
                      disabled={actionLoading}
                      className={`flex-1 text-xs gap-1.5 h-8.5 font-semibold cursor-pointer ${
                        !selectedReport.post.isDelete
                          ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:hover:bg-rose-900/20"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      <Trash2 className="size-3.5" />
                      {selectedReport.post.isDelete
                        ? "Khôi phục bài viết"
                        : "Xóa bài viết"}
                    </Button>

                    {/* Toggle Comments Disabled */}
                    <Button
                      size="sm"
                      variant={
                        selectedReport.post.isCommentDisabled
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleTogglePostCommentDisabled(selectedReport.post._id)
                      }
                      disabled={actionLoading}
                      className={`flex-1 text-xs gap-1.5 h-8.5 font-semibold cursor-pointer ${
                        !selectedReport.post.isCommentDisabled
                          ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200 dark:hover:bg-amber-900/20"
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                      }`}
                    >
                      <XCircle className="size-3.5" />
                      {selectedReport.post.isCommentDisabled
                        ? "Mở bình luận"
                        : "Khóa bình luận"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-amber-500/5 rounded-lg border border-amber-500/20 text-center my-auto bg-background">
                <AlertTriangle className="size-8 text-amber-500 mb-2" />
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                  Bài viết gốc không tồn tại
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                  Bài viết bị báo cáo này đã được xóa hoàn toàn khỏi hệ thống
                  database.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 m-2 border-t bg-muted/20">
          <Button
            variant="outline"
            onClick={() => setIsDetailOpen(false)}
            className="w-full sm:w-auto h-9 font-medium cursor-pointer"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailModal;
