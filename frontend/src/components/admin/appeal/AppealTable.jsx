import React from "react";
import { Eye, Check, X } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const AppealTable = ({
  appeals,
  translateAppealType,
  setSelectedAppeal,
  handleAction,
  page,
  totalPages,
  setPage,
}) => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[120px] pl-6 py-3">Mã khiếu nại</TableHead>
              <TableHead className="min-w-[150px]">Người dùng</TableHead>
              <TableHead className="w-[180px]">Loại khiếu nại</TableHead>
              <TableHead className="w-[120px]">Ngày tạo</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-[150px] text-right pr-6">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appeals.map((appeal) => (
              <TableRow key={appeal._id} className="hover:bg-muted/10 transition">
                <TableCell className="pl-6 font-semibold text-foreground">
                  #{appeal._id.slice(-6).toUpperCase()}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold text-foreground">
                      {appeal.user?.username || "unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appeal.user?.email || "N/A"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground block w-fit">
                    {translateAppealType(appeal.appealType)}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(appeal.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      appeal.status === "Pending"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : appeal.status === "Resolved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {appeal.status === "Pending"
                      ? "Chờ xử lý"
                      : appeal.status === "Resolved"
                        ? "Đã khôi phục"
                        : "Đã từ chối"}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedAppeal(appeal)}
                      className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition cursor-pointer"
                      title="Xem Chi Tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {appeal.status === "Pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleAction(appeal._id, "Resolved", "Approved (Restored)")
                          }
                          className="p-1.5 hover:bg-emerald-500/15 rounded-lg text-emerald-600 dark:text-emerald-400 transition cursor-pointer"
                          title="Chấp nhận"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleAction(appeal._id, "Rejected", "Decision Upheld")
                          }
                          className="p-1.5 hover:bg-rose-500/15 rounded-lg text-rose-600 dark:text-rose-455 transition cursor-pointer"
                          title="Từ chối"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {appeals.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="p-8 text-center text-muted-foreground">
                  Không tìm thấy khiếu nại nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/10">
          <div className="text-xs text-muted-foreground">
            Trang <span className="font-semibold text-foreground">{page}</span> trên{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 text-xs cursor-pointer"
            >
              Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(p)}
                className="h-8 w-8 text-xs cursor-pointer"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 text-xs cursor-pointer"
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppealTable;
