import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeads, getAdminLeads, deleteLead } from "../../../services/admin/AdServices";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  ArrowLeft, Users, CheckCircle2, FileSpreadsheet, RefreshCw, Search
} from "lucide-react";
import toast from "react-hot-toast";
import LeadTableRow from "../../../components/admin/ads/leads/LeadTableRow";
import LeadDetailDialog from "../../../components/admin/ads/leads/LeadDetailDialog";

const AdLeadsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userCurrent } = useAuth();
  const isAdmin = userCurrent?.role === "admin";

  const [leads, setLeads] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = isAdmin ? await getAdminLeads() : await getLeads();
      if (res?.success) {
        // Lọc các lead thuộc chiến dịch này
        const campaignLeads = (res.leads || []).filter(
          (lead) => lead.campaign?._id === id
        );
        setLeads(campaignLeads);

        if (campaignLeads.length > 0) {
          setCampaign(campaignLeads[0].campaign);
        } else {
          setCampaign(null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải thông tin phản hồi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, isAdmin]);

  const handleDelete = async (leadId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi đăng ký này không?")) return;
    try {
      const res = await deleteLead(leadId);
      if (res?.success) {
        toast.success("Xóa phản hồi thành công.");
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa bản ghi.");
    }
  };

  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const filteredLeads = leads.filter((lead) => {
    const textSearch = searchTerm.toLowerCase();
    const userText = (lead.user?.full_name || "Khách vãng lai").toLowerCase() + " " + (lead.user?.email || "").toLowerCase();
    const answersText = lead.answers.map((a) => `${a.label} ${a.value}`).join(" ").toLowerCase();
    
    return userText.includes(textSearch) || answersText.includes(textSearch);
  });

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      toast.error("Không có dữ liệu để xuất.");
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Thời gian,Người dùng,Email/Thông tin liên hệ,Chi tiết câu trả lời\n";
    
    filteredLeads.forEach((lead) => {
      const time = new Date(lead.createdAt).toLocaleString("vi-VN");
      const userName = lead.user?.full_name || "Khách vãng lai";
      const contactInfo = lead.user?.email || "N/A";
      const answersStr = lead.answers.map((a) => `${a.label}: ${a.value}`).join(" | ");
      
      const row = `"${time}","${userName}","${contactInfo}","${answersStr}"`;
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leads_Campaign_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Xuất file CSV thành công!");
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Back navigation & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/admin/ads/leads")}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh mục biểu mẫu
          </button>
          
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Chi tiết phản hồi: {campaign?.title || `Chiến dịch (${id})`}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Quản lý thông tin đăng ký Form của chiến dịch quảng cáo. ID: <span className="font-mono">{id}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-600 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
            title="Làm mới"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Xuất Excel/CSV chiến dịch
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80 shadow-xs">
        <Search className="absolute left-7 top-6.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng theo tên, email hoặc nội dung câu trả lời..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50/50 dark:bg-zinc-950/40 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="w-full py-20 flex flex-col justify-center items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <span className="text-xs text-slate-400">Đang tải danh sách đăng ký...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-xl border border-slate-100 dark:border-zinc-800/80 shadow-xs">
          <CheckCircle2 className="h-10 w-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Không tìm thấy câu trả lời nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Chưa có khách hàng nào đăng ký điền biểu mẫu cho chiến dịch này hoặc nội dung tìm kiếm không phù hợp.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/40 text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-zinc-800/80">
                <tr>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Câu trả lời</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
                {filteredLeads.map((lead) => (
                  <LeadTableRow
                    key={lead._id}
                    lead={lead}
                    onViewDetails={handleViewDetails}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-zinc-950/20 text-slate-400 dark:text-zinc-500 font-medium border-t border-slate-100 dark:border-zinc-800/80">
            <span>Hiển thị {filteredLeads.length} của {leads.length} phản hồi đăng ký</span>
          </div>
        </div>
      )}

      {/* Modal chi tiết phản hồi */}
      <LeadDetailDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedLead={selectedLead}
      />

    </div>
  );
};

export default AdLeadsDetails;
