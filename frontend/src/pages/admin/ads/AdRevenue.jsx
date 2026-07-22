import React, { useEffect, useState } from "react";
import { CircleDollarSign, BarChart3, TrendingUp, RefreshCw } from "lucide-react";
import { getAdminCampaigns } from "../../../services/admin/AdServices";
import toast from "react-hot-toast";

const AdRevenue = () => {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminCampaigns();
      if (data?.success) {
        const list = data.campaigns;
        
        let impressions = 0;
        let clicks = 0;
        let active = 0;
        let revenue = 0;

        list.forEach((c) => {
          impressions += c.metrics?.impressions || 0;
          clicks += c.metrics?.clicks || 0;
          if (c.status === "active") active++;
          
          if (c.pricingModel === "CPM") {
            revenue += (c.metrics?.impressions || 0) * 100;
          } else {
            revenue += (c.metrics?.clicks || 0) * 1000;
          }
        });

        setStats({
          totalCampaigns: list.length,
          activeCampaigns: active,
          totalImpressions: impressions,
          totalClicks: clicks,
          totalRevenue: revenue,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi đồng bộ doanh thu quảng cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CircleDollarSign className="h-6 w-6 text-emerald-500" />
            Báo cáo doanh thu quảng cáo
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
            Tổng quan tài chính, số liệu click và lượt xem từ quảng cáo trên PingUp.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
            Tổng doanh thu ước tính
          </span>
          <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.totalRevenue.toLocaleString()} VNĐ
          </h2>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span>Tăng trưởng tự động</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
            Tổng số click chuột
          </span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100">
            {stats.totalClicks.toLocaleString()}
          </h2>
          <span className="text-[11px] text-slate-400 block mt-2">
            Tỷ lệ click trung bình (CTR): {stats.totalImpressions ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2) : 0}%
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
            Lượt xem hiển thị (Imp)
          </span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100">
            {stats.totalImpressions.toLocaleString()}
          </h2>
          <span className="text-[11px] text-slate-400 block mt-2">
            Số lần hiển thị hợp lệ trên thiết bị
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
            Chiến dịch hoạt động
          </span>
          <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.activeCampaigns} / {stats.totalCampaigns}
          </h2>
          <span className="text-[11px] text-slate-400 block mt-2">
            Các chiến dịch đang tiếp cận người dùng
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          Phân tích mô hình định giá quảng cáo
        </h3>
        <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed mb-4">
          Hệ thống đang áp dụng 2 hình thức thanh toán chính:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-lg space-y-2 border border-slate-100 dark:border-zinc-800/40">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200">Mô hình CPC (Cost Per Click)</h4>
            <p className="text-slate-500 dark:text-zinc-400 text-xs">
              Mỗi lượt nhấp chuột vào liên kết quảng cáo sẽ trừ trực tiếp ngân sách chiến dịch (1,000 VNĐ / click). Giúp nhà quảng cáo tối ưu hóa chuyển đổi.
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-lg space-y-2 border border-slate-100 dark:border-zinc-800/40">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200">Mô hình CPM (Cost Per Mille)</h4>
            <p className="text-slate-500 dark:text-zinc-400 text-xs">
              Mỗi lượt hiển thị của quảng cáo tới mắt người dùng sẽ trừ trực tiếp ngân sách chiến dịch (100 VNĐ / impression). Tối ưu cho chiến dịch nhận diện thương hiệu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdRevenue;
