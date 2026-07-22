import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeads, getAdminLeads, deleteLead } from "../../../services/admin/AdServices";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  ArrowLeft, Users, Calendar, Trash2, CheckCircle2, FileSpreadsheet, RefreshCw, Search, Eye, Mail, Tag, FileText
} from "lucide-react";
import toast from "react-hot-toast";

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
                  <th className="p-4">Nội dung câu trả lời</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/30 transition">
                    
                    {/* Thời gian */}
                    <td className="p-4 whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(lead.createdAt).toLocaleString("vi-VN")}</span>
                      </div>
                    </td>

                    {/* Khách hàng */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {lead.user?.profile_picture ? (
                          <img
                            src={lead.user.profile_picture}
                            className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-zinc-800"
                            alt=""
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs select-none">
                            {(lead.user?.full_name || "K").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {lead.user?.full_name || "Khách vãng lai"}
                          </div>
                          {lead.user?.email && (
                            <div className="text-[10px] text-slate-400">{lead.user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Nội dung câu trả lời động */}
                    <td className="p-4 max-w-xs">
                      <div className="space-y-1 bg-slate-50 dark:bg-zinc-950/55 p-3 rounded-xl border border-slate-100 dark:border-zinc-800/40 shadow-inner">
                        {lead.answers.slice(0, 2).map((answer, index) => (
                          <div key={index} className="flex gap-1.5 text-[11px]">
                            <span className="font-bold text-slate-400 dark:text-zinc-500 min-w-[80px] shrink-0 uppercase tracking-wider text-[8px] mt-0.5">
                              {answer.label}:
                            </span>
                            <span className="text-slate-800 dark:text-zinc-200 font-semibold break-all truncate max-w-[170px]">
                              {answer.value}
                            </span>
                          </div>
                        ))}
                        {lead.answers.length > 2 && (
                          <div 
                            className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 cursor-pointer hover:underline inline-block" 
                            onClick={() => handleViewDetails(lead)}
                          >
                            + Xem thêm {lead.answers.length - 2} câu trả lời
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Hành động */}
                    <td className="p-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(lead)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition"
                          title="Xem chi tiết câu trả lời"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                          title="Xóa thông tin này"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
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
      {isModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl md:max-w-2xl rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header: Gradient background */}
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800/80 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  Chi tiết thông tin phản hồi
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                  Đăng ký lúc: {new Date(selectedLead.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Profile Card & Info */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Khách hàng
                </h4>
                <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-zinc-950/30 border border-slate-100 dark:border-zinc-800/50 flex items-center gap-4">
                  {selectedLead.user?.profile_picture ? (
                    <img
                      src={selectedLead.user.profile_picture}
                      className="h-14 w-14 rounded-full object-cover border-2 border-indigo-500/20 shadow-sm"
                      alt=""
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                      {(selectedLead.user?.full_name || "K").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {selectedLead.user?.full_name || "Khách vãng lai"}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                      @{selectedLead.user?.username || "username_khong_ton_tai"}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {selectedLead.user?.email || "Chưa cung cấp email"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin chiến dịch & Hệ thống */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Nguồn chiến dịch
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-800/40 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Tên chiến dịch</span>
                    <span className="text-xs text-slate-800 dark:text-zinc-200 font-bold block truncate" title={selectedLead.campaign?.title}>
                      {selectedLead.campaign?.title || "Không rõ"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-800/40 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Danh mục</span>
                    <span className="text-xs text-slate-800 dark:text-zinc-200 font-bold block truncate">
                      {selectedLead.campaign?.category || "Chưa phân loại"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-800/40 space-y-1 md:col-span-2">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">ID Đăng ký (Lead ID)</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono block break-all">
                      {selectedLead._id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Câu trả lời biểu mẫu */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Nội dung câu trả lời
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 border border-slate-100 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm">
                  {selectedLead.answers.map((answer, index) => (
                    <div key={index} className="p-4 flex flex-col gap-1.5 hover:bg-slate-50/40 dark:hover:bg-zinc-950/10 transition">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        {answer.label}
                      </span>
                      {String(answer.value).startsWith("http") ? (
                        <div className="mt-1">
                          {String(answer.value).match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                            <a href={answer.value} target="_blank" rel="noreferrer" className="inline-block group relative cursor-pointer">
                              <img src={answer.value} className="max-h-32 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs object-contain bg-slate-50" alt="" />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center text-[10px] text-white font-bold">
                                Mở ảnh mới ↗
                              </div>
                            </a>
                          ) : (
                            <a
                              href={answer.value}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                            >
                              Xem/Tải tệp đính kèm ↗
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-850 dark:text-zinc-150 font-bold break-all leading-relaxed whitespace-pre-wrap">
                          {answer.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdLeadsDetails;
