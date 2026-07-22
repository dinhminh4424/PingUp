import { TrendingUp, Trash2, Edit2, Play, Pause, Users } from "lucide-react";
import { toggleCampaignStatus } from "../../../services/admin/AdServices";
import toast from "react-hot-toast";

const AdCard = ({ campaign, onEdit, onDelete, onStatusChange, onViewLeads }) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      paused: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
      rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
      completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || ""}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleToggleStatus = async () => {
    const nextStatus = campaign.status === "active" ? "paused" : "active";
    try {
      const res = await toggleCampaignStatus(campaign._id, nextStatus);
      if (res?.success) {
        toast.success(`Đã chuyển trạng thái chiến dịch thành ${nextStatus}`);
        onStatusChange(campaign._id, nextStatus);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi chuyển trạng thái");
    }
  };

  const canToggleStatus = ["active", "paused"].includes(campaign.status);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {campaign.mediaUrl && (
        <img
          src={campaign.mediaUrl}
          alt={campaign.title}
          className="w-full h-44 object-cover"
        />
      )}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {getStatusBadge(campaign.status)}
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 dark:bg-zinc-950 px-2 py-0.5 rounded">
              {campaign.pricingModel}
            </span>
          </div>
          
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-lg line-clamp-1 flex-1">
              {campaign.title}
            </h3>
            
            <div className="flex items-center gap-1.5">
              {canToggleStatus && (
                <button
                  onClick={handleToggleStatus}
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition"
                  title={campaign.status === "active" ? "Tạm dừng chạy quảng cáo" : "Kích hoạt chạy quảng cáo"}
                >
                  {campaign.status === "active" ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
                </button>
              )}
              
              <button
                onClick={() => onEdit(campaign)}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition"
                title="Chỉnh sửa quảng cáo"
              >
                <Edit2 className="h-4.5 w-4.5" />
              </button>
              
              <button
                onClick={() => onDelete(campaign._id)}
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition"
                title="Xóa quảng cáo"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
          
          <p className="text-slate-500 dark:text-zinc-400 text-sm line-clamp-2">
            {campaign.content}
          </p>
        </div>

        <div className="border-t border-slate-50 dark:border-zinc-800/80 pt-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Nhà quảng cáo</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-300">
              {campaign.advertiser?.full_name || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Mục tiêu</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-300 line-clamp-1">
              {campaign.targeting?.location?.join(", ") || "Toàn quốc"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Tổng ngân sách</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {campaign.budget?.total?.toLocaleString()} VNĐ
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Còn lại</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {Math.round(campaign.budget?.remaining)?.toLocaleString()} VNĐ
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg flex items-center justify-between text-xs font-medium text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <span>Lượt xem: <strong className="text-slate-800 dark:text-zinc-200">{campaign.metrics?.impressions}</strong></span>
          </div>
          <span>Click: <strong className="text-slate-800 dark:text-zinc-200">{campaign.metrics?.clicks}</strong></span>
        </div>

        {campaign.ctaButtons?.some(b => b.actionType === "lead_form") && (
          <button
            onClick={() => onViewLeads(campaign)}
            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-indigo-600 dark:text-indigo-300 font-semibold rounded-lg text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <Users className="h-3.5 w-3.5" />
            Xem phản hồi Form (Leads)
          </button>
        )}
      </div>
    </div>
  );
};

export default AdCard;
