import React, { useEffect, useState } from "react";
import { Check, X, ShieldAlert, User, Eye, Link as LinkIcon } from "lucide-react";
import { getAdminCampaigns, reviewCampaign } from "../../../services/admin/AdServices";
import toast from "react-hot-toast";

const AdReview = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await getAdminCampaigns();
      if (data?.success) {
        const pendingList = data.campaigns.filter((c) => c.status === "pending");
        setCampaigns(pendingList);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReview = async (id, status) => {
    try {
      const data = await reviewCampaign(id, status);
      if (data?.success) {
        toast.success(status === "approved" ? "Đã phê duyệt & kích hoạt quảng cáo!" : "Đã từ chối quảng cáo.");
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi phê duyệt chiến dịch");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-amber-500" />
          Phê duyệt chiến dịch quảng cáo
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
          Duyệt hoặc từ chối các chiến dịch quảng cáo mới được gửi lên.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Đang tải danh sách chờ duyệt...</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl p-10 text-center text-slate-500">
          Hiện tại không có quảng cáo nào đang chờ duyệt.
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl shadow-sm p-6 flex flex-col lg:flex-row gap-6 items-start justify-between"
            >
              <div className="flex-1 flex flex-col md:flex-row gap-6">
                {campaign.mediaUrl && (
                  <img
                    src={campaign.mediaUrl}
                    alt={campaign.title}
                    className="w-full md:w-56 h-36 object-cover rounded-lg border border-slate-100 dark:border-zinc-800"
                  />
                )}
                <div className="space-y-3">
                  <div>
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2">
                      ĐANG CHỜ DUYỆT
                    </span>
                    <span className="bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {campaign.pricingModel}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    {campaign.content}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Nhà quảng cáo: <strong className="text-slate-600 dark:text-zinc-300">{campaign.advertiser?.full_name || "N/A"}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      Độ tuổi: <strong className="text-slate-600 dark:text-zinc-300">{campaign.targeting?.ageMin} - {campaign.targeting?.ageMax} tuổi</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <LinkIcon className="h-3.5 w-3.5" />
                      Liên kết: <a href={campaign.targetUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">{campaign.targetUrl}</a>
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto flex flex-row lg:flex-col gap-3 self-stretch lg:justify-center border-t lg:border-t-0 border-slate-50 dark:border-zinc-800/80 pt-4 lg:pt-0">
                <div className="text-right text-sm hidden lg:block mb-2">
                  <span className="text-slate-400 block">Ngân sách chiến dịch</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">
                    {campaign.budget?.total?.toLocaleString()} VNĐ
                  </span>
                </div>
                
                <div className="flex w-full gap-2">
                  <button
                    onClick={() => handleReview(campaign._id, "approved")}
                    className="flex-1 lg:w-36 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition"
                  >
                    <Check className="h-4 w-4" />
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => handleReview(campaign._id, "rejected")}
                    className="flex-1 lg:w-36 flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition"
                  >
                    <X className="h-4 w-4" />
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdReview;
