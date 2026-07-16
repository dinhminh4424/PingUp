import React from "react";
import { Star, Eye, CheckCircle } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const FeedbackTable = ({ feedbacks, loading, onOpenDetail, onMarkReviewed }) => {
  return (
    <div className="rounded-b-xl border-t overflow-hidden w-full">
      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Đang tải danh sách phản hồi...</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[100px] pl-6 py-3">Mã</TableHead>
                <TableHead className="min-w-[150px]">Người dùng</TableHead>
                <TableHead className="w-[120px]">Phân loại</TableHead>
                <TableHead className="w-[120px]">Đánh giá</TableHead>
                <TableHead className="min-w-[250px]">Nội dung & Media</TableHead>
                <TableHead className="w-[120px]">Ngày tạo</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead className="w-[160px] text-right pr-6">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((fb) => (
                <TableRow
                  key={fb._id}
                  onClick={() => onOpenDetail(fb)}
                  className="hover:bg-muted/10 transition cursor-pointer"
                >
                  <TableCell className="pl-6 font-semibold text-foreground">
                    {fb._id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={fb.userId?.profile_picture || "/default-avatar.avif"}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {fb.userId?.full_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{fb.userId?.username || "anonymous"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                        fb.category === "bug"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-450"
                          : fb.category === "suggestion"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-450"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-455"
                      }`}
                    >
                      {fb.category === "bug" ? "Báo lỗi" : fb.category === "suggestion" ? "Góp ý" : fb.category === "compliment" ? "Khen ngợi" : "Khác"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: fb.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                      {Array.from({ length: 5 - fb.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-muted/30" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md text-xs leading-relaxed">
                    <p className="italic font-medium text-foreground truncate max-w-xs">"{fb.comment}"</p>
                    {fb.media && fb.media.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {fb.media.map((url, i) => {
                          const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("/video");
                          return (
                            <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shadow-2xs bg-muted flex-shrink-0">
                              {isVideo ? (
                                <video src={url} className="w-full h-full object-cover" muted />
                              ) : (
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(fb.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        fb.status === "New"
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {fb.status === "New" ? "Mới" : "Đã xem"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onOpenDetail(fb)}
                        className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Chi tiết</span>
                      </button>
                      {fb.status === "New" && (
                        <button
                          onClick={() => onMarkReviewed(fb._id)}
                          className="p-1.5 hover:bg-indigo-500/15 rounded-lg text-indigo-600 dark:text-indigo-400 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                          title="Đánh dấu đã xem"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Duyệt</span>
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {feedbacks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="p-8 text-center text-muted-foreground">
                    Không tìm thấy phản hồi nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FeedbackTable;
