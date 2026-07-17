import React, { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import { getAppeals, resolveAppeal } from "../../services/admin/AppealServices";
import AppealFilterBar from "../../components/admin/appeal/AppealFilterBar";
import AppealTable from "../../components/admin/appeal/AppealTable";
import AppealDetailSidebar from "../../components/admin/appeal/AppealDetailSidebar";

const translateAppealType = (type) => {
  const translations = {
    "Post Removal Appeal": "Kháng nghị gỡ bài viết",
    "Comment Removal Appeal": "Kháng nghị gỡ bình luận",
    "Chat/Message Restriction Appeal": "Kháng nghị hạn chế chat",
    "Account Warning / Strike": "Cảnh cáo tài khoản",
    "Account Suspension / Temporary Lock": "Khóa tài khoản tạm thời",
    "Nudity & Sexual Content Strike Appeal": "Kháng nghị nội dung nhạy cảm",
    "Hate Speech & Harassment Appeal": "Kháng nghị quấy rối/kích động",
    "Spam / False Positive Appeal": "Kháng nghị Spam/Nhầm lẫn",
    "Intellectual Property / Copyright Appeal": "Kháng nghị bản quyền",
    "Other Moderation Action": "Kháng nghị xử lý khác"
  };
  return translations[type] || type;
};

const translateTargetModel = (model) => {
  const translations = {
    "Post": "Bài viết",
    "Comment": "Bình luận",
    "Story": "Story",
    "Conversation": "Tin nhắn",
    "User": "Tài khoản"
  };
  return translations[model] || model;
};

const AppealManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [appeals, setAppeals] = useState([]);

  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [selectedTargetModel, setSelectedTargetModel] = useState("all");
  const [selectedAppealType, setSelectedAppealType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeedbacksCount, setTotalFeedbacksCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset page to 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedTargetModel, selectedAppealType, selectedStatus, dateRange.startDate, dateRange.endDate]);

  const handleAction = async (id, newStatus, resultMessage) => {
    try {
      const res = await resolveAppeal(id, newStatus, resultMessage);
      if (res.success) {
        toast.success("Xử lý khiếu nại thành công!");
        setAppeals((prev) =>
          prev.map((apl) =>
            apl._id === id
              ? { ...apl, status: newStatus, result: resultMessage }
              : apl,
          ),
        );
        if (selectedAppeal && selectedAppeal._id === id) {
          setSelectedAppeal((prev) => ({
            ...prev,
            status: newStatus,
            result: resultMessage,
          }));
        }
      } else {
        toast.error(res.message || "Xử lý thất bại");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Có lỗi xảy ra");
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedTargetModel("all");
    setSelectedAppealType("all");
    setDateRange({ startDate: "", endDate: "" });
    setPage(1);
    toast.success("Đã đặt lại bộ lọc");
  };

  const fetchAppeals = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAppeals(
        searchTerm,
        selectedTargetModel,
        selectedAppealType,
        selectedStatus,
        dateRange.startDate,
        dateRange.endDate,
        page,
      );
      if (result.success) {
        setAppeals(result.appeals || []);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalFeedbacksCount(result.pagination.totalAppeals || 0);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Không thể tải danh sách kháng nghị",
      );
      toast.error(err.response?.data?.message || "Lỗi tải dữ liệu phản hồi!");
      console.error("Lỗi: ", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAppeals();
  }, [
    searchTerm,
    selectedTargetModel,
    selectedAppealType,
    selectedStatus,
    dateRange.startDate,
    dateRange.endDate,
    page,
  ]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-600" />
            Quản lý khiếu nại người dùng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xem xét và xử lý các khiếu nại về nội dung và cảnh cáo tài khoản từ người dùng.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Table List Card */}
        <Card className="flex-1 shadow-xs border-border w-full overflow-hidden">
          <CardHeader className="pb-4">
            <AppealFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedTargetModel={selectedTargetModel}
              setSelectedTargetModel={setSelectedTargetModel}
              selectedAppealType={selectedAppealType}
              setSelectedAppealType={setSelectedAppealType}
              dateRange={dateRange}
              setDateRange={setDateRange}
              handleResetFilters={handleResetFilters}
              totalFeedbacksCount={totalFeedbacksCount}
            />
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <AppealTable
              appeals={appeals}
              translateAppealType={translateAppealType}
              setSelectedAppeal={setSelectedAppeal}
              handleAction={handleAction}
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />
          </CardContent>
        </Card>

        {/* Details Sidebar panel */}
        <AppealDetailSidebar
          selectedAppeal={selectedAppeal}
          setSelectedAppeal={setSelectedAppeal}
          translateTargetModel={translateTargetModel}
          translateAppealType={translateAppealType}
          handleAction={handleAction}
        />
      </div>
    </div>
  );
};

export default AppealManagement;
