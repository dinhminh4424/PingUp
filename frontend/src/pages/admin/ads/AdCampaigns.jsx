import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Search, Plus } from "lucide-react";
import { getAdminCampaigns, deleteCampaign } from "../../../services/admin/AdServices";
import toast from "react-hot-toast";
import AdCard from "../../../components/admin/ads/AdCard";
import AdFormModal from "../../../components/admin/ads/AdFormModal";

const AdCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getAdminCampaigns();
      if (data?.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lấy danh sách chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chiến dịch quảng cáo này?")) return;
    try {
      const data = await deleteCampaign(id);
      if (data?.success) {
        toast.success("Xóa chiến dịch quảng cáo thành công!");
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi xóa chiến dịch");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setCampaigns((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
    );
  };

  const openCreateModal = () => {
    setSelectedCampaign(null);
    setIsModalOpen(true);
  };

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filtered = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.advertiser?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Tất cả chiến dịch quảng cáo
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
            Danh sách toàn bộ chiến dịch quảng cáo trên hệ thống PingUp.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, nhà quảng cáo..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Tạo chiến dịch
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Đang tải danh sách...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl p-10 text-center text-slate-500">
          Không tìm thấy chiến dịch nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((campaign) => (
            <AdCard
              key={campaign._id}
              campaign={campaign}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onViewLeads={(c) => navigate(`/admin/ads/leads/${c._id}`)}
            />
          ))}
        </div>
      )}

      {/* Form Modal cho tạo mới & sửa */}
      <AdFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
};

export default AdCampaigns;
