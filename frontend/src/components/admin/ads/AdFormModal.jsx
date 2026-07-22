import React, { useEffect, useState } from "react";
import { 
  X, Megaphone, Eye, Sparkles, Plus, Trash2, Link2, Palette, ListTodo,
  ArrowRight, ShoppingCart, Mail, Info, MessageCircle, Play, Download, Phone, UserCheck, Gift
} from "lucide-react";
import { createCampaign, updateCampaign } from "../../../services/admin/AdServices";
import toast from "react-hot-toast";

const AdFormModal = ({ isOpen, onClose, campaign, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  
  const [form, setForm] = useState({
    title: "",
    content: "",
    targetUrl: "",
    pricingModel: "CPC",
    budgetTotal: "",
    dailyLimit: "",
    location: "",
    ageMin: 18,
    ageMax: 100,
    category: "Khác",
    displayOption: "both",
    ctaButtons: [
      { label: "Tìm hiểu thêm", actionType: "link", actionUrl: "", icon: "ArrowRight", backgroundColor: "#4f46e5", textColor: "#ffffff", iconColor: "#ffffff" }
    ],
    leadFormConfig: {
      title: "Đăng ký tư vấn / Nhận ưu đãi",
      description: "Nhập thông tin bên dưới để kết nối với chúng tôi.",
      imageUrl: "",
      fields: [
        { label: "Họ và tên", fieldType: "text", required: true, options: [] },
        { label: "Số điện thoại", fieldType: "tel", required: true, options: [] }
      ]
    },
    file: null,
  });

  useEffect(() => {
    if (campaign) {
      let displayOption = "both";
      if (campaign.displayPlacements?.length === 1) {
        displayOption = campaign.displayPlacements[0] === "FEED_NATIVE" ? "feed" : "sidebar";
      }

      setForm({
        title: campaign.title || "",
        content: campaign.content || "",
        targetUrl: campaign.targetUrl || "",
        pricingModel: campaign.pricingModel || "CPC",
        budgetTotal: campaign.budget?.total || "",
        dailyLimit: campaign.budget?.dailyLimit || "",
        location: campaign.targeting?.location?.join(", ") || "",
        ageMin: campaign.targeting?.ageMin || 18,
        ageMax: campaign.targeting?.ageMax || 100,
        category: campaign.category || "Khác",
        displayOption,
        ctaButtons: campaign.ctaButtons && campaign.ctaButtons.length > 0
          ? campaign.ctaButtons
          : [{ label: "Tìm hiểu thêm", actionType: "link", actionUrl: "", icon: "ArrowRight", backgroundColor: "#4f46e5", textColor: "#ffffff", iconColor: "#ffffff" }],
        leadFormConfig: campaign.leadFormConfig || {
          title: "Đăng ký tư vấn / Nhận ưu đãi",
          description: "Nhập thông tin bên dưới để kết nối với chúng tôi.",
          imageUrl: "",
          fields: [
            { label: "Họ và tên", fieldType: "text", required: true, options: [] },
            { label: "Số điện thoại", fieldType: "tel", required: true, options: [] }
          ]
        },
        file: null,
      });
      setPreviewImage(campaign.mediaUrl || "");
    } else {
      setForm({
        title: "",
        content: "",
        targetUrl: "",
        pricingModel: "CPC",
        budgetTotal: "",
        dailyLimit: "",
        location: "",
        ageMin: 18,
        ageMax: 100,
        category: "Khác",
        displayOption: "both",
        ctaButtons: [
          { label: "Tìm hiểu thêm", actionType: "link", actionUrl: "", icon: "ArrowRight", backgroundColor: "#4f46e5", textColor: "#ffffff", iconColor: "#ffffff" }
        ],
        leadFormConfig: {
          title: "Đăng ký tư vấn / Nhận ưu đãi",
          description: "Nhập thông tin bên dưới để kết nối với chúng tôi.",
          imageUrl: "",
          fields: [
            { label: "Họ và tên", fieldType: "text", required: true, options: [] },
            { label: "Số điện thoại", fieldType: "tel", required: true, options: [] }
          ]
        },
        file: null,
      });
      setPreviewImage("");
    }
  }, [campaign, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setForm((prev) => ({ ...prev, file: selectedFile }));
    
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(objectUrl);
    }
  };

  // --- QUẢN LÝ CTA BUTTONS & MÀU SẮC ---
  const handleAddCtaButton = () => {
    setForm((prev) => ({
      ...prev,
      ctaButtons: [
        ...prev.ctaButtons,
        { label: "Tìm hiểu thêm", actionType: "link", actionUrl: "", icon: "ArrowRight", backgroundColor: "#4f46e5", textColor: "#ffffff", iconColor: "#ffffff" }
      ]
    }));
  };

  const handleRemoveCtaButton = (index) => {
    if (form.ctaButtons.length <= 1) {
      toast.error("Phải có ít nhất 1 nút bấm hành động");
      return;
    }
    setForm((prev) => ({
      ...prev,
      ctaButtons: prev.ctaButtons.filter((_, i) => i !== index)
    }));
  };

  const handleCtaButtonChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.ctaButtons];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, ctaButtons: updated };
    });
  };

  // --- QUẢN LÝ DYNAMIC LEAD FORM CONFIG ---
  const handleLeadFormMetaChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      leadFormConfig: {
        ...prev.leadFormConfig,
        [field]: value
      }
    }));
  };

  const handleAddField = () => {
    setForm((prev) => ({
      ...prev,
      leadFormConfig: {
        ...prev.leadFormConfig,
        fields: [
          ...prev.leadFormConfig.fields,
          { label: "Câu hỏi mới", fieldType: "text", required: true, options: [] }
        ]
      }
    }));
  };

  const handleRemoveField = (index) => {
    if (form.leadFormConfig.fields.length <= 1) {
      toast.error("Form tối thiểu phải có 1 trường nhập thông tin");
      return;
    }
    setForm((prev) => ({
      ...prev,
      leadFormConfig: {
        ...prev.leadFormConfig,
        fields: prev.leadFormConfig.fields.filter((_, i) => i !== index)
      }
    }));
  };

  const handleFieldChange = (index, field, value) => {
    setForm((prev) => {
      const fieldsCopy = [...prev.leadFormConfig.fields];
      fieldsCopy[index] = { ...fieldsCopy[index], [field]: value };
      return {
        ...prev,
        leadFormConfig: {
          ...prev.leadFormConfig,
          fields: fieldsCopy
        }
      };
    });
  };

  // --- QUẢN LÝ LỰA CHỌN (OPTIONS) DÀNH CHO SELECT / RADIO ---
  const handleAddFieldOption = (fieldIndex) => {
    setForm((prev) => {
      const fieldsCopy = [...prev.leadFormConfig.fields];
      const currentOptions = fieldsCopy[fieldIndex].options || [];
      fieldsCopy[fieldIndex] = {
        ...fieldsCopy[fieldIndex],
        options: [...currentOptions, `Lựa chọn ${currentOptions.length + 1}`],
      };
      return {
        ...prev,
        leadFormConfig: {
          ...prev.leadFormConfig,
          fields: fieldsCopy,
        },
      };
    });
  };

  const handleRemoveFieldOption = (fieldIndex, optionIndex) => {
    setForm((prev) => {
      const fieldsCopy = [...prev.leadFormConfig.fields];
      const currentOptions = fieldsCopy[fieldIndex].options || [];
      fieldsCopy[fieldIndex] = {
        ...fieldsCopy[fieldIndex],
        options: currentOptions.filter((_, i) => i !== optionIndex),
      };
      return {
        ...prev,
        leadFormConfig: {
          ...prev.leadFormConfig,
          fields: fieldsCopy,
        },
      };
    });
  };

  const handleFieldOptionChange = (fieldIndex, optionIndex, value) => {
    setForm((prev) => {
      const fieldsCopy = [...prev.leadFormConfig.fields];
      const currentOptions = [...(fieldsCopy[fieldIndex].options || [])];
      currentOptions[optionIndex] = value;
      fieldsCopy[fieldIndex] = {
        ...fieldsCopy[fieldIndex],
        options: currentOptions,
      };
      return {
        ...prev,
        leadFormConfig: {
          ...prev.leadFormConfig,
          fields: fieldsCopy,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.targetUrl || !form.budgetTotal) {
      toast.error("Vui lòng điền các trường bắt buộc");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("targetUrl", form.targetUrl);
      formData.append("pricingModel", form.pricingModel);
      formData.append("budgetTotal", form.budgetTotal);
      formData.append("dailyLimit", form.dailyLimit || 0);
      formData.append("category", form.category);

      let placements = ["FEED_NATIVE", "SIDEBAR_SPONSORED"];
      if (form.displayOption === "feed") placements = ["FEED_NATIVE"];
      if (form.displayOption === "sidebar") placements = ["SIDEBAR_SPONSORED"];
      formData.append("displayPlacements", JSON.stringify(placements));

      formData.append("ctaButtons", JSON.stringify(form.ctaButtons));
      formData.append("leadFormConfig", JSON.stringify(form.leadFormConfig));

      const targeting = {
        location: form.location ? form.location.split(",").map((s) => s.trim()) : [],
        ageMin: Number(form.ageMin),
        ageMax: Number(form.ageMax),
      };
      formData.append("targeting", JSON.stringify(targeting));

      if (form.file) {
        formData.append("image", form.file);
      }

      let res;
      if (campaign) {
        res = await updateCampaign(campaign._id, formData);
      } else {
        res = await createCampaign(formData);
      }

      if (res?.success) {
        toast.success(campaign ? "Cập nhật thành công! Đang chờ duyệt lại." : "Tạo chiến dịch thành công! Đang chờ phê duyệt.");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi xử lý chiến dịch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstimation = () => {
    const budget = Number(form.budgetTotal) || 0;
    if (form.pricingModel === "CPC") {
      const estimatedClicks = Math.floor(budget / 1000);
      return `Ước tính mang lại khoảng ${estimatedClicks.toLocaleString()} lượt click chuột thực tế.`;
    } else {
      const estimatedViews = Math.floor(budget / 100);
      return `Ước tính tiếp cận khoảng ${estimatedViews.toLocaleString()} lượt hiển thị thương hiệu.`;
    }
  };

  const renderCtaIconPreview = (iconName, color) => {
    const style = color ? { color } : {};
    switch (iconName) {
      case "ShoppingCart": return <ShoppingCart className="h-3.5 w-3.5" style={style} />;
      case "Mail": return <Mail className="h-3.5 w-3.5" style={style} />;
      case "Info": return <Info className="h-3.5 w-3.5" style={style} />;
      case "MessageCircle": return <MessageCircle className="h-3.5 w-3.5" style={style} />;
      case "Play": return <Play className="h-3.5 w-3.5" style={style} />;
      case "Download": return <Download className="h-3.5 w-3.5" style={style} />;
      case "Phone": return <Phone className="h-3.5 w-3.5" style={style} />;
      case "UserCheck": return <UserCheck className="h-3.5 w-3.5" style={style} />;
      case "Gift": return <Gift className="h-3.5 w-3.5" style={style} />;
      default: return <ArrowRight className="h-3.5 w-3.5" style={style} />;
    }
  };

  const isFormUsingLeadForm = form.ctaButtons.some((b) => b.actionType === "lead_form");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-950/40">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            {campaign ? "Cập nhật chiến dịch" : "Tạo chiến dịch mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* Column 1: Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full lg:w-3/5 p-6 overflow-y-auto space-y-4 no-scrollbar border-r border-slate-100 dark:border-zinc-800/80"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Core Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tiêu đề quảng cáo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề quảng cáo hấp dẫn..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Nội dung mô tả <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="content"
                  required
                  rows="3"
                  value={form.content}
                  onChange={handleInputChange}
                  placeholder="Nhập nội dung tiếp thị chi tiết..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            </div>

            {/* Custom CTA Buttons & Colors */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-950/60 rounded-xl space-y-3 border border-slate-100 dark:border-zinc-800/40">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="h-4 w-4 text-indigo-500" />
                  Nút kêu gọi hành động & Màu sắc
                </h3>
                <button
                  type="button"
                  onClick={handleAddCtaButton}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="h-3 w-3" /> Thêm nút
                </button>
              </div>

              <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar">
                {form.ctaButtons.map((btn, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-800 relative space-y-3"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveCtaButton(index)}
                      className="absolute right-2 top-2 p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Xóa nút này"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="text-[10px] font-bold text-indigo-500 uppercase">Nút #{index + 1}</div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">Nhãn nút (Tự nhập)</label>
                        <input
                          type="text"
                          required
                          value={btn.label}
                          onChange={(e) => handleCtaButtonChange(index, "label", e.target.value)}
                          placeholder="Ví dụ: Đăng ký ngay, Mua ngay..."
                          className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">Loại hành động</label>
                        <select
                          value={btn.actionType}
                          onChange={(e) => handleCtaButtonChange(index, "actionType", e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white"
                        >
                          <option value="link">Mở liên kết URL</option>
                          <option value="lead_form">Mở Lead Form</option>
                        </select>
                      </div>

                      {btn.actionType === "link" && (
                        <div className="col-span-2">
                          <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">URL tuỳ chỉnh của nút</label>
                          <input
                            type="url"
                            value={btn.actionUrl || ""}
                            onChange={(e) => handleCtaButtonChange(index, "actionUrl", e.target.value)}
                            placeholder="Mặc định sử dụng URL chính"
                            className="w-full px-2 py-1 border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      )}

                      <div className="col-span-2">
                        <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">Biểu tượng</label>
                        <select
                          value={btn.icon}
                          onChange={(e) => handleCtaButtonChange(index, "icon", e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white"
                        >
                          <option value="ArrowRight">Mũi tên phải (ArrowRight)</option>
                          <option value="ShoppingCart">Giỏ hàng (ShoppingCart)</option>
                          <option value="Mail">Hòm thư (Mail)</option>
                          <option value="Info">Thông tin (Info)</option>
                          <option value="MessageCircle">Tin nhắn chat (MessageCircle)</option>
                          <option value="Play">Xem video (Play)</option>
                          <option value="Download">Tải xuống (Download)</option>
                          <option value="Phone">Điện thoại (Phone)</option>
                          <option value="UserCheck">Đăng ký (UserCheck)</option>
                          <option value="Gift">Hộp quà (Gift)</option>
                        </select>
                      </div>

                      {/* Tùy chỉnh màu sắc nút bấm */}
                      <div className="col-span-2 grid grid-cols-3 gap-2 pt-1 border-t border-dashed border-slate-100 dark:border-zinc-800/80">
                        <div>
                          <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">Màu nền nút</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={btn.backgroundColor || "#4f46e5"}
                              onChange={(e) => handleCtaButtonChange(index, "backgroundColor", e.target.value)}
                              className="w-6 h-6 border-0 p-0 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={btn.backgroundColor || "#4f46e5"}
                              onChange={(e) => handleCtaButtonChange(index, "backgroundColor", e.target.value)}
                              className="w-full px-1.5 py-0.5 border border-slate-200 dark:border-zinc-800 rounded text-[10px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">Màu chữ nút</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={btn.textColor || "#ffffff"}
                              onChange={(e) => handleCtaButtonChange(index, "textColor", e.target.value)}
                              className="w-6 h-6 border-0 p-0 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={btn.textColor || "#ffffff"}
                              onChange={(e) => handleCtaButtonChange(index, "textColor", e.target.value)}
                              className="w-full px-1.5 py-0.5 border border-slate-200 dark:border-zinc-800 rounded text-[10px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">Màu Icon</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={btn.iconColor || "#ffffff"}
                              onChange={(e) => handleCtaButtonChange(index, "iconColor", e.target.value)}
                              className="w-6 h-6 border-0 p-0 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={btn.iconColor || "#ffffff"}
                              onChange={(e) => handleCtaButtonChange(index, "iconColor", e.target.value)}
                              className="w-full px-1.5 py-0.5 border border-slate-200 dark:border-zinc-800 rounded text-[10px]"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DYNAMIC LEAD FORM DESIGNER */}
            {isFormUsingLeadForm && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl space-y-3 border border-amber-100/50 dark:border-amber-900/30">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo className="h-4 w-4 text-amber-600" />
                    Thiết kế Form thu thập thông tin (Lead Form)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Thêm câu hỏi
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold text-amber-600 mb-0.5">Tiêu đề Form</label>
                    <input
                      type="text"
                      value={form.leadFormConfig.title}
                      onChange={(e) => handleLeadFormMetaChange("title", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold text-amber-600 mb-0.5">Mô tả Form ngắn</label>
                    <input
                      type="text"
                      value={form.leadFormConfig.description}
                      onChange={(e) => handleLeadFormMetaChange("description", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[9px] font-semibold text-amber-600 mb-0.5">Link ảnh Banner Form (tuỳ chọn)</label>
                    <input
                      type="url"
                      value={form.leadFormConfig.imageUrl || ""}
                      onChange={(e) => handleLeadFormMetaChange("imageUrl", e.target.value)}
                      placeholder="Dán link ảnh https://... để làm ảnh banner đại diện trên đầu form"
                      className="w-full px-2 py-1 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                  {form.leadFormConfig.fields.map((field, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white dark:bg-zinc-900 rounded border border-slate-100 dark:border-zinc-800 relative space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold text-slate-400">Câu hỏi #{index + 1}</div>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(index)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[8px] font-bold text-slate-400 uppercase">Tiêu đề câu hỏi</label>
                          <input
                            type="text"
                            value={field.label}
                            required
                            placeholder="Ví dụ: Bạn sinh năm bao nhiêu?..."
                            onChange={(e) => handleFieldChange(index, "label", e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 dark:border-zinc-800 rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] font-bold text-slate-400 uppercase">Loại câu trả lời</label>
                          <select
                            value={field.fieldType}
                            onChange={(e) => handleFieldChange(index, "fieldType", e.target.value)}
                            className="w-full px-1.5 py-1 border border-slate-200 dark:border-zinc-800 rounded text-xs bg-white dark:bg-zinc-900"
                          >
                            <option value="text">Nhập văn bản ngắn (Text)</option>
                            <option value="email">Nhập Email (Email)</option>
                            <option value="tel">Nhập Số điện thoại (Tel)</option>
                            <option value="textarea">Nhập Văn bản dài (Textarea)</option>
                            <option value="select">Hộp lựa chọn thả xuống (Dropdown)</option>
                            <option value="radio">Nút chọn một phương án (Radio Button)</option>
                          </select>
                        </div>

                        <div className="flex items-center pl-2">
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => handleFieldChange(index, "required", e.target.checked)}
                              className="rounded border-slate-200 dark:border-zinc-800 text-indigo-600 focus:ring-0"
                            />
                            Bắt buộc trả lời
                          </label>
                        </div>

                        {/* Quản lý lựa chọn option cho dropdown/radio bằng nút thêm */}
                        {(field.fieldType === "select" || field.fieldType === "radio") && (
                          <div className="col-span-2 bg-slate-50 dark:bg-zinc-950/40 p-3 rounded border border-slate-100 dark:border-zinc-800/80 space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="block text-[8px] font-bold text-slate-400 uppercase">Danh sách các lựa chọn</label>
                              <button
                                type="button"
                                onClick={() => handleAddFieldOption(index)}
                                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                              >
                                <Plus className="h-3 w-3" /> Thêm lựa chọn
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {(field.options || []).map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    required
                                    value={opt}
                                    onChange={(e) => handleFieldOptionChange(index, oIdx, e.target.value)}
                                    placeholder={`Lựa chọn ${oIdx + 1}`}
                                    className="w-full px-2 py-0.5 border border-slate-200 dark:border-zinc-800 rounded text-xs bg-white dark:bg-zinc-900"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFieldOption(index, oIdx)}
                                    className="text-slate-400 hover:text-rose-600 transition shrink-0"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                              {(field.options || []).length === 0 && (
                                <div className="text-[10px] text-slate-400 italic">Chưa có lựa chọn nào. Hãy nhấn thêm!</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target URL & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Thể loại quảng cáo / Báo cáo
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Khác">Khác</option>
                  <option value="Công nghệ">Công nghệ</option>
                  <option value="Thời trang">Thời trang</option>
                  <option value="Ẩn thực">Ẩn thực</option>
                  <option value="Giáo dục">Giáo dục</option>
                  <option value="Sức khỏe">Sức khỏe</option>
                  <option value="Giải trí">Giải trí</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Vị trí hiển thị quảng cáo
                </label>
                <select
                  name="displayOption"
                  value={form.displayOption}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="feed">Chỉ hiện trên Feed (Bảng tin)</option>
                  <option value="sidebar">Chỉ hiện trên Sidebar (Thanh bên)</option>
                  <option value="both">Hiển thị ở cả Feed và Sidebar</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Liên kết đích chung (Target URL chính khi nhấn vào ảnh) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  name="targetUrl"
                  required
                  value={form.targetUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Hình thức thanh toán
                </label>
                <select
                  name="pricingModel"
                  value={form.pricingModel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CPC">CPC (Trả theo Click)</option>
                  <option value="CPM">CPM (Trả theo View)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tổng ngân sách (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="budgetTotal"
                  required
                  min="10000"
                  value={form.budgetTotal}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 100000"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {form.budgetTotal && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs flex items-start gap-2 border border-indigo-100/60 dark:border-indigo-900/40">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{getEstimation()}</span>
              </div>
            )}

            {/* Targeting */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Địa điểm target (dấu phẩy)
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  placeholder="Hà Nội, Đà Nẵng, TP.HCM"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Độ tuổi mục tiêu
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="ageMin"
                    min="13"
                    max="100"
                    value={form.ageMin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    name="ageMax"
                    min="13"
                    max="100"
                    value={form.ageMax}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Hình ảnh/Video quảng cáo {campaign && <span className="text-slate-400 font-normal">(để trống nếu không đổi)</span>}
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-zinc-800 dark:file:text-zinc-300 file:cursor-pointer hover:file:bg-indigo-100 dark:hover:file:bg-zinc-700"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                {isSubmitting ? "Đang xử lý..." : campaign ? "Cập nhật" : "Tạo chiến dịch"}
              </button>
            </div>
          </form>

          {/* Column 2: Live Preview */}
          <div 
            className="w-full lg:w-2/5 p-6 bg-slate-50 dark:bg-zinc-950/20 flex flex-col items-center justify-start border-t lg:border-t-0 border-slate-100 dark:border-zinc-800/80 overflow-y-auto no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 self-start">
              <Eye className="h-4 w-4" />
              Xem trước quảng cáo ({form.displayOption === "both" ? "Cả hai" : form.displayOption === "feed" ? "Bảng tin" : "Thanh bên"})
            </div>

            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-5 rounded-2xl shadow-md flex flex-col gap-3.5 transition-all mb-4">
              
              {/* Click target link headers */}
              <a
                href={form.targetUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-95"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col">
                    <span className="text-slate-800 dark:text-zinc-200 font-bold text-[13px] tracking-wide line-clamp-1">
                      {form.title || "Tiêu đề chiến dịch"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                      Phân loại: <strong className="text-slate-600 dark:text-zinc-300">{form.category}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-full shrink-0">
                    Tài trợ
                  </span>
                </div>

                <div className="w-full aspect-[3/2] overflow-hidden rounded-lg bg-slate-50 dark:bg-zinc-950 flex items-center justify-center border border-dashed border-slate-200 dark:border-zinc-800">
                  {previewImage ? (
                    previewImage.endsWith(".mp4") || previewImage.includes("video") || (form.file && form.file.type.includes("video")) ? (
                      <video src={previewImage} className="w-full h-full object-cover" muted autoPlay loop />
                    ) : (
                      <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                    )
                  ) : (
                    <span className="text-slate-400 text-xs">Không có hình ảnh/video</span>
                  )}
                </div>
              </a>

              <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-xs line-clamp-2 min-h-[2rem]">
                {form.content || "Nội dung quảng cáo sẽ xuất hiện ở đây..."}
              </p>

              {/* Dynamic CTA Buttons List Preview with Custom Colors & Icons */}
              <div className="pt-2.5 border-t border-slate-50 dark:border-zinc-800/80 space-y-2">
                <div className="text-[9px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Link2 className="h-3 w-3" /> Nút liên kết hành động ({form.ctaButtons.length})
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {form.ctaButtons.map((btn, i) => (
                    <button
                      key={i}
                      type="button"
                      style={{
                        backgroundColor: btn.backgroundColor || "#4f46e5",
                        color: btn.textColor || "#ffffff"
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                    >
                      <span>{btn.label || "Nút"}</span>
                      {renderCtaIconPreview(btn.icon, btn.iconColor || btn.textColor || "#ffffff")}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Live Form Preview overlay (Dành cho Lead Form tự thiết kế) */}
            {isFormUsingLeadForm && (
              <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl shadow-md overflow-hidden flex flex-col">
                <div className="text-[9px] font-bold text-amber-600 bg-amber-50/50 p-2 uppercase border-b border-slate-100 flex items-center gap-1 shrink-0">
                  Xem trước Lead Form tự thiết kế
                </div>
                
                {/* Ảnh banner Form */}
                {form.leadFormConfig.imageUrl && (
                  <div className="w-full aspect-[4/1] overflow-hidden bg-slate-50 border-b border-slate-100 shrink-0">
                    <img src={form.leadFormConfig.imageUrl} className="w-full h-full object-cover" alt="Form Banner" />
                  </div>
                )}

                <div className="p-4 space-y-3 overflow-y-auto max-h-60 no-scrollbar flex-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {form.leadFormConfig.title || "Tiêu đề Form"}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {form.leadFormConfig.description || "Mô tả Form ngắn"}
                  </p>
                  
                  <div className="space-y-2 pt-1">
                    {form.leadFormConfig.fields.map((f, index) => (
                      <div key={index}>
                        <label className="block text-[9px] text-slate-400 mb-0.5">
                          {f.label || `Trường nhập #${index+1}`} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {f.fieldType === "textarea" ? (
                          <textarea disabled className="w-full p-1 border border-slate-100 dark:border-zinc-800 rounded text-[10px] bg-slate-50/50" rows="1" />
                        ) : f.fieldType === "select" ? (
                          <select disabled className="w-full p-1 border border-slate-100 dark:border-zinc-800 rounded text-[10px] bg-slate-50/50">
                            {f.options && f.options.length > 0 ? (
                              f.options.map((opt, oIdx) => (
                                <option key={oIdx}>{opt}</option>
                              ))
                            ) : (
                              <option>Chưa cấu hình các lựa chọn</option>
                            )}
                          </select>
                        ) : f.fieldType === "radio" ? (
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            {f.options && f.options.length > 0 ? (
                              f.options.map((opt, oIdx) => (
                                <label key={oIdx} className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <input type="radio" disabled className="h-3 w-3 text-indigo-600 focus:ring-0" />
                                  {opt}
                                </label>
                              ))
                            ) : (
                              <span className="text-[9px] text-slate-400">Chưa cấu hình các lựa chọn</span>
                            )}
                          </div>
                        ) : (
                          <input type="text" disabled className="w-full p-1 border border-slate-100 dark:border-zinc-800 rounded text-[10px] bg-slate-50/50" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdFormModal;
