import React from "react";
import { Check, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AppealDetailSidebar = ({
  selectedAppeal,
  setSelectedAppeal,
  translateTargetModel,
  translateAppealType,
  handleAction,
}) => {
  if (!selectedAppeal) return null;

  return (
    <Card className="w-full lg:w-96 shadow-xs border-border flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
      <CardHeader className="pb-4 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-lg">Chi tiết khiếu nại</CardTitle>
          <CardDescription className="text-xs">
            #{selectedAppeal._id.slice(-6).toUpperCase()}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedAppeal(null)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <hr className="border-border" />

        <div className="flex flex-col gap-3">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Người dùng
            </span>
            <p className="font-medium text-foreground">
              {selectedAppeal.user?.full_name || selectedAppeal.user?.username} (
              {selectedAppeal.user?.email || "N/A"})
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mã nội dung
            </span>
            <p className="font-medium text-foreground bg-muted/50 p-1.5 rounded-lg text-xs break-all mt-1">
              {selectedAppeal.targetId}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Đối tượng bị phạt
            </span>
            <p className="font-medium text-foreground bg-muted/30 p-1.5 px-2.5 rounded-lg text-xs mt-1 w-fit">
              {translateTargetModel(selectedAppeal.targetModel)}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Loại khiếu nại
            </span>
            <p className="font-medium text-foreground">
              {translateAppealType(selectedAppeal.appealType)}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nội dung / Lý do khiếu nại
            </span>
            <p className="text-muted-foreground mt-1 leading-relaxed bg-muted/20 p-3 rounded-xl border border-border text-xs italic">
              "{selectedAppeal.reason}"
            </p>
          </div>
          {selectedAppeal.media && selectedAppeal.media.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Tệp / Hình ảnh đính kèm
              </span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {selectedAppeal.media.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition"
                      onClick={() => window.open(url, "_blank")}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedAppeal.result && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kết quả giải quyết
              </span>
              <p className="font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 p-2 rounded-lg text-xs mt-1">
                {selectedAppeal.result === "Approved (Restored)"
                  ? "Đã khôi phục"
                  : "Giữ nguyên quyết định xử lý"}
              </p>
            </div>
          )}
        </div>

        {selectedAppeal.status === "Pending" && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() =>
                handleAction(selectedAppeal._id, "Resolved", "Approved (Restored)")
              }
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Chấp nhận
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction(selectedAppeal._id, "Rejected", "Decision Upheld")}
              className="flex-1 font-semibold text-xs rounded-xl cursor-pointer"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Từ chối
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppealDetailSidebar;
