import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLeads, getAdminLeads } from "../../../services/admin/AdServices";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  Users, Search, RefreshCw, Layers, ArrowRight, UserCheck
} from "lucide-react";
import toast from "react-hot-toast";

const AdLeads = () => {
  const { userCurrent } = useAuth();
  const isAdmin = userCurrent?.role === "admin";
  const navigate = useNavigate();
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeadsData = async () => {
    try {
      setLoading(true);
      const res = isAdmin ? await getAdminLeads() : await getLeads();
      if (res?.success) {
        setLeads(res.leads || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách câu trả lời.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsData();
  }, [isAdmin]);

  // Nhóm Leads theo Chiến dịch
  const groupLeadsByCampaign = () => {
    const groups = {};
    leads.forEach((lead) => {
      if (!lead.campaign) return;
      const campaignId = lead.campaign._id;
      if (!groups[campaignId]) {
        groups[campaignId] = {
          campaign: lead.campaign,
          advertiser: lead.advertiser,
          leadsList: [],
        };
      }
      groups[campaignId].leadsList.push(lead);
    });
    return Object.values(groups);
  };

  const campaignItems = groupLeadsByCampaign();

  // Lọc theo từ khoá tìm kiếm (Tên chiến dịch, tên nhà quảng cáo)
  const filteredCampaignItems = campaignItems.filter((item) => {
    const text = searchTerm.toLowerCase();
    const matchesTitle = (item.campaign?.title || "").toLowerCase().includes(text);
    const matchesAdvertiser = (item.advertiser?.full_name || "").toLowerCase().includes(text);
    return matchesTitle || matchesAdvertiser;
  });

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Danh mục Biểu mẫu & Câu trả lời (Leads)
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Xem danh sách các biểu mẫu quảng cáo đã có khách hàng đăng ký điền thông tin.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeadsData}
            className="p-2 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-600 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
            title="Làm mới"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80 shadow-xs">
        <Search className="absolute left-7 top-6.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm biểu mẫu theo tên chiến dịch hoặc nhà quảng cáo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50/50 dark:bg-zinc-950/40 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="w-full py-20 flex flex-col justify-center items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <span className="text-xs text-slate-400">Đang tải dữ liệu biểu mẫu...</span>
        </div>
      ) : filteredCampaignItems.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-xl border border-slate-100 dark:border-zinc-800/80 shadow-xs">
          <Users className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Không tìm thấy biểu mẫu quảng cáo nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Chưa có chiến dịch quảng cáo Lead Form nào nhận được phản hồi đăng ký từ người dùng.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaignItems.map((item) => (
            <div 
              key={item.campaign._id}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm p-5 hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-full">
                    {item.campaign.category || "Khác"}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                    <UserCheck className="h-3 w-3" />
                    <span>{item.leadsList.length} Leads</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">
                  {item.campaign.title}
                </h3>
                
                <p className="text-xs text-slate-400 dark:text-zinc-500 line-clamp-2">
                  ID: <span className="font-mono text-[10px] text-slate-500">{item.campaign._id}</span>
                </p>

                {isAdmin && (
                  <div className="text-[11px] text-slate-500 border-t border-slate-50 dark:border-zinc-800/80 pt-2.5">
                    <span className="text-slate-400">Nhà quảng cáo:</span> <strong className="text-slate-700 dark:text-zinc-300">{item.advertiser?.full_name || "N/A"}</strong>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(`/admin/ads/leads/${item.campaign._id}`)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Xem danh sách câu trả lời</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdLeads;
