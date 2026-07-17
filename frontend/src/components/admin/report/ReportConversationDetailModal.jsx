import React from "react";
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
  Clock,
  Ban,
  Trash2,
  ShieldCheck,
  XCircle,
  Users,
} from "lucide-react";

const ReportConversationDetailModal = ({
  isDetailOpen,
  setIsDetailOpen,
  selectedReport,
  handleUpdateStatus,
  handleToggleActive,
  handleToggleDelete,
}) => {
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

  return (
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="sm:max-w-4xl w-[95vw] rounded-xl p-0 overflow-hidden border border-border shadow-2xl">
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <DialogHeader className="p-5 border-b bg-muted/20">
          <div>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              Chi tiết báo cáo hộp thoại
              <span className="font-mono text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                #{selectedReport._id.substring(selectedReport._id.length - 8).toUpperCase()}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Gửi lúc {formatDate(selectedReport.createdAt)}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border max-h-[65vh] overflow-y-auto scrollbar-hide">
          
          {/* Left Column: Report info */}
          <div className="p-5 space-y-4 text-xs">
            <h3 className="text-sm font-bold tracking-tight text-primary flex items-center gap-1.5 border-b pb-2">
              <AlertTriangle className="size-4 animate-pulse text-amber-500" />
              NỘI DUNG BÁO CÁO
            </h3>

            <div>
              <span className="font-bold text-slate-500 block mb-1">Người báo cáo:</span>
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                <Avatar className="size-10 border border-border">
                  <AvatarImage src={selectedReport.reporterId?.profile_picture} />
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

            <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg space-y-2 border">
              <div>
                <span className="font-bold text-slate-500">Lý do báo cáo:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{selectedReport.reason}</p>
              </div>
              {selectedReport.details && (
                <div>
                  <span className="font-bold text-slate-500">Chi tiết thêm:</span>
                  <p className="mt-0.5 whitespace-pre-wrap">{selectedReport.details}</p>
                </div>
              )}
            </div>

            {/* Evidence Images */}
            {selectedReport.file && selectedReport.file.length > 0 && (
              <div>
                <span className="font-bold text-slate-500 block mb-1">Hình ảnh bằng chứng:</span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedReport.file.map((url, i) => (
                    <a href={url} target="_blank" rel="noreferrer" key={i} className="block aspect-video rounded border overflow-hidden hover:opacity-90 relative group">
                      <img src={url} className="size-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-[10px] font-medium px-2 py-1 rounded bg-black/60">
                          Xem ảnh lớn
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Conversation info */}
          <div className="p-5 space-y-4 text-xs bg-muted/10">
            <h3 className="text-sm font-bold tracking-tight text-primary flex items-center gap-1.5 border-b pb-2">
              <Users className="size-4 text-indigo-500" />
              THÔNG TIN HỘP THOẠI
            </h3>

            <div>
              <span className="font-bold text-slate-500 block mb-1">Thông tin Nhóm / Hộp thoại:</span>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border">
                <Avatar className="size-10 rounded-lg">
                  <AvatarImage src={selectedReport.conversation?.group?.imageGroup || "/default-avatar.avif"} className="rounded-lg object-cover" />
                  <AvatarFallback className="rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">G</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">
                    {selectedReport.conversation?.group?.name || "Hộp thoại"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    Loại: {selectedReport.conversation?.type} • {selectedReport.conversation?.participants?.length || 0} thành viên
                  </p>
                </div>
              </div>
            </div>

            {/* Participants list */}
            {selectedReport.conversation?.participants && (
              <div>
                <span className="font-bold text-slate-500 block mb-1.5">Thành viên cuộc trò chuyện:</span>
                <div className="bg-white dark:bg-zinc-900 border rounded-lg p-2.5 max-h-40 overflow-y-auto space-y-2">
                  {selectedReport.conversation.participants.map((p, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-1.5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="size-6">
                          <AvatarImage src={p.userId?.profile_picture} />
                          <AvatarFallback className="text-[10px]">{getInitials(p.userId?.full_name || p.userId?.username)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold truncate">{p.userId?.full_name || "Thành viên"}</p>
                          <p className="text-[9px] text-muted-foreground truncate">@{p.userId?.username}</p>
                        </div>
                      </div>
                      {p.role === "admin" && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold bg-indigo-50 text-indigo-650 rounded">Admin</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Actions */}
            <div className="border-t border-border pt-4 space-y-3">
              <span className="font-bold text-slate-500 block">Thao tác giải quyết:</span>
              <div className="flex flex-wrap gap-2">
                {selectedReport.status === "pending" && (
                  <>
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => handleUpdateStatus(selectedReport._id, "resolved")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <ShieldCheck className="size-3.5" />
                      Giải quyết (Resolved)
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedReport._id, "dismissed")}
                      className="cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <XCircle className="size-3.5 text-slate-500" />
                      Bác bỏ (Dismiss)
                    </Button>
                  </>
                )}
                <Button
                  size="xs"
                  variant={selectedReport.conversation?.isActive === false ? "default" : "destructive"}
                  onClick={() => handleToggleActive(selectedReport.conversation?._id)}
                  className="cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Ban className="size-3.5" />
                  {selectedReport.conversation?.isActive === false ? "Kích hoạt lại nhóm" : "Khóa hoạt động nhóm"}
                </Button>

                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleToggleDelete(selectedReport.conversation?._id)}
                  className="cursor-pointer text-red-650 hover:bg-red-50 hover:text-red-700 flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="size-3.5" />
                  {selectedReport.conversation?.isDelete ? "Khôi phục nhóm" : "Đánh dấu Xóa nhóm"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-2 m-2 border-t bg-muted/20">
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

export default ReportConversationDetailModal;
