import React, { useEffect, useState } from "react";
import {
  History,
  Search,
  Trash2,
  RefreshCw,
  Users,
  CheckCircle,
  Clock,
  Ban,
  Info,
  AlertTriangle,
  AlertCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getBroadcastHistory,
  revokeBroadcast,
} from "../../../services/admin/SystemNotificationServices";

const TYPE_CONFIG = {
  info: { label: "Info", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: Info },
  warning: { label: "Warning", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800", icon: AlertCircle },
  danger: { label: "Danger", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800", icon: AlertTriangle },
  lock: { label: "Lock", color: "bg-red-600/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800", icon: Lock },
  success: { label: "Success", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", icon: CheckCircle },
};

const STATUS_CONFIG = {
  sent: { label: "Đã phát", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: CheckCircle },
  scheduled: { label: "Đã lên lịch", color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: Clock },
  cancelled: { label: "Đã thu hồi", color: "bg-neutral-500/10 text-neutral-500 border-neutral-200", icon: Ban },
};

const NotificationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getBroadcastHistory({
        page,
        limit: pagination.limit,
        type: typeFilter,
        search,
      });
      if (res.success) {
        setHistory(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (error) {
      toast.error("Không thể tải lịch sử thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(1);
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn thu hồi chiến dịch thông báo này? Hành động này sẽ gỡ thông báo khỏi Feed người dùng.")) return;
    try {
      const res = await revokeBroadcast(id);
      if (res.success) {
        toast.success("Đã thu hồi thông báo");
        fetchHistory(pagination.page);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thu hồi thông báo");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <History className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Lịch Sử Phát Thông Báo
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Theo dõi nhật ký các đợt phát thông báo toàn hệ thống và thu hồi khi cần thiết.
          </p>
        </div>
        <button
          onClick={() => fetchHistory(pagination.page)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl text-sm transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
            Loại thông báo:
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả loại</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="lock">Lock</option>
            <option value="success">Success</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Thông báo</th>
                <th className="py-3.5 px-4">Loại & Kênh</th>
                <th className="py-3.5 px-4">Đối tượng</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Thời gian gửi</th>
                <th className="py-3.5 px-4">Người gửi</th>
                <th className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400">
                    Đang tải dữ liệu lịch sử...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400">
                    Chưa có lịch sử phát thông báo nào.
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const typeObj = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
                  const statusObj = STATUS_CONFIG[item.status] || STATUS_CONFIG.sent;
                  const StatusIcon = statusObj.icon;
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 text-[11px]">
                          {item.content}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeObj.color}`}
                        >
                          {typeObj.label}
                        </span>
                        <div className="text-[10px] text-neutral-400">
                          {item.displayType === "both" ? "Feed & Modal" : item.displayType === "modal" ? "Modal Pop-up" : "Chuông Feed"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300 font-medium">
                          <Users className="w-3.5 h-3.5 text-neutral-400" />
                          {item.targetType === "all"
                            ? "Tất cả User"
                            : item.targetType === "role"
                            ? `Role (${item.targetValues?.join(", ")})`
                            : `${item.totalTargets} Users`}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          Tệp: {item.totalTargets} người
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusObj.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusObj.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400 text-[11px]">
                        {item.sentAt
                          ? new Date(item.sentAt).toLocaleString("vi-VN")
                          : item.scheduledAt
                          ? `Hẹn: ${new Date(item.scheduledAt).toLocaleString("vi-VN")}`
                          : "-"}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400 font-medium">
                        {item.sentBy?.fullName || item.sentBy?.username || "Admin"}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        {item.status !== "cancelled" ? (
                          <button
                            onClick={() => handleRevoke(item._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg cursor-pointer transition-colors"
                            title="Thu hồi thông báo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Thu hồi
                          </button>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">Đã thu hồi</span>
                        )}
                      </td>
                    </tr>
                  );
                }))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Trang {pagination.page} / {pagination.totalPages} (Tổng {pagination.total} mục)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchHistory(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchHistory(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationHistory;
