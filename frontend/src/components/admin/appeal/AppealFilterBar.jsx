import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AppealFilterBar = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedTargetModel,
  setSelectedTargetModel,
  selectedAppealType,
  setSelectedAppealType,
  dateRange,
  setDateRange,
  handleResetFilters,
  totalFeedbacksCount,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Header title and counts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Danh sách kháng cáo</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hiện có {totalFeedbacksCount} yêu cầu phù hợp với bộ lọc.
          </p>
        </div>
        {/* Reset button and Search input */}
        <div className="flex gap-2 items-center">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo người dùng, ID, lý do..."
              className="pl-8 h-8 text-xs bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw className="size-3" />
            Đặt lại
          </Button>
        </div>
      </div>

      {/* Row 2: Secondary Filter Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 items-end bg-muted/20 p-3.5 rounded-xl border border-border">
        {/* Filter 1: Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trạng thái</label>
          <select
            className="h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs outline-none cursor-pointer focus-visible:border-ring"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Resolved">Đã khôi phục</option>
            <option value="Rejected">Đã từ chối</option>
          </select>
        </div>

        {/* Filter 2: Target Model */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đối tượng bị phạt</label>
          <select
            className="h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs outline-none cursor-pointer focus-visible:border-ring"
            value={selectedTargetModel}
            onChange={(e) => setSelectedTargetModel(e.target.value)}
          >
            <option value="all">Tất cả đối tượng</option>
            <option value="Post">Bài viết</option>
            <option value="Comment">Bình luận</option>
            <option value="Story">Story</option>
            <option value="Conversation">Tin nhắn</option>
            <option value="User">Tài khoản</option>
          </select>
        </div>

        {/* Filter 3: Appeal Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Thể loại kháng nghị</label>
          <select
            className="h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs outline-none cursor-pointer focus-visible:border-ring"
            value={selectedAppealType}
            onChange={(e) => setSelectedAppealType(e.target.value)}
          >
            <option value="all">Tất cả thể loại</option>
            <option value="Post Removal Appeal">Kháng nghị gỡ bài viết</option>
            <option value="Comment Removal Appeal">Kháng nghị gỡ bình luận</option>
            <option value="Chat/Message Restriction Appeal">Kháng nghị hạn chế chat</option>
            <option value="Account Warning / Strike">Cảnh cáo tài khoản</option>
            <option value="Account Suspension / Temporary Lock">Khóa tài khoản tạm thời</option>
            <option value="Nudity & Sexual Content Strike Appeal">Nội dung nhạy cảm</option>
            <option value="Hate Speech & Harassment Appeal">Ngôn từ kích động/Quấy rối</option>
            <option value="Spam / False Positive Appeal">Spam / Báo cáo nhầm</option>
            <option value="Intellectual Property / Copyright Appeal">Bản quyền</option>
            <option value="Other Moderation Action">Xử lý khác</option>
          </select>
        </div>

        {/* Filter 4: Start Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Từ ngày</label>
          <input
            type="date"
            className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:border-ring"
            value={dateRange.startDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
          />
        </div>

        {/* Filter 5: End Date */}
        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đến ngày</label>
          <input
            type="date"
            className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:border-ring"
            value={dateRange.endDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
};

export default AppealFilterBar;
