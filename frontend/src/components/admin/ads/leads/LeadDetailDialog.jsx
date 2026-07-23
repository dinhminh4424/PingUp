import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../ui/dialog";
import { Users, X } from "lucide-react";

const LeadDetailDialog = ({ isOpen, onClose, selectedLead }) => {
  const isImageUrl = (val) => {
    if (typeof val !== "string") return false;
    const cleanVal = val.trim();
    return (
      cleanVal.startsWith("http") &&
      (
        cleanVal.endsWith(".jpg") ||
        cleanVal.endsWith(".jpeg") ||
        cleanVal.endsWith(".png") ||
        cleanVal.endsWith(".gif") ||
        cleanVal.endsWith(".webp") ||
        cleanVal.includes("/image/upload/") ||
        cleanVal.includes("cloudinary.com")
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Chi tiết câu trả lời của khách hàng
          </DialogTitle>
          <DialogDescription className="text-slate-400 dark:text-zinc-500">
            Xem toàn bộ các câu trả lời mà khách hàng đã cung cấp qua biểu mẫu thu thập thông tin.
          </DialogDescription>
        </DialogHeader>
        
        {selectedLead && (
          <div className="space-y-4 pt-2">
            
            {/* User Profile Header info */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
              {selectedLead.user?.profile_picture ? (
                <img
                  src={selectedLead.user.profile_picture}
                  className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-100 dark:border-zinc-800"
                  alt=""
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 uppercase text-sm">
                  {(selectedLead.user?.full_name || "K")[0]}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedLead.user?.full_name || "Khách vãng lai"}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {selectedLead.user?.email || "Chưa đăng ký email"}
                </p>
              </div>
            </div>

            {/* Answer List Cards */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Nội dung câu trả lời</span>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {selectedLead.answers.map((ans, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-slate-150/40 dark:border-zinc-800/60 transition hover:bg-slate-100/50 dark:hover:bg-zinc-950/70">
                    <span className="block text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
                      {ans.label}
                    </span>
                    <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 break-all leading-relaxed">
                      {isImageUrl(ans.value) || ans.fieldType === "image" ? (
                        <a 
                          href={ans.value} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block mt-1 hover:opacity-90 transition-opacity"
                        >
                          <img 
                            src={ans.value} 
                            alt={ans.label} 
                            className="max-w-xs max-h-48 object-cover rounded-lg border border-slate-200 dark:border-zinc-800/80 shadow-xs" 
                          />
                        </a>
                      ) : (
                        <span>{ans.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Registration date */}
            <div className="text-[10px] text-slate-400 pt-3 flex justify-between border-t border-slate-100 dark:border-zinc-800/80">
              <span>Đăng ký lúc:</span>
              <span>{new Date(selectedLead.createdAt).toLocaleString("vi-VN")}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;
