import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Send,
  Eye,
  Lock,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Clock,
  Users,
  Layers,
  FileSpreadsheet,
  Upload,
  Code2,
  FileCode,
  Palette,
  MousePointerClick,
  Maximize2,
  Image as ImageIcon,
  Plus,
  Trash2,
  FormInput,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  sendBroadcast,
  getTemplates,
  uploadModalImage,
} from "../../../services/admin/SystemNotificationServices";
import { ICON_MAP, BUTTON_COLOR_MAP } from "../../../components/SystemModal";

const TYPE_THEMES = {
  lock: {
    bgColor: "bg-red-50/50 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    buttonColor: "bg-red-600 hover:bg-red-700 text-white",
    borderColor: "border-red-100 dark:border-red-900/50",
    IconComponent: Lock,
  },
  danger: {
    bgColor: "bg-red-50/50 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    buttonColor: "bg-red-600 hover:bg-red-700 text-white",
    borderColor: "border-red-100 dark:border-red-900/50",
    IconComponent: AlertTriangle,
  },
  warning: {
    bgColor: "bg-amber-50/50 dark:bg-amber-900/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    buttonColor: "bg-amber-600 hover:bg-amber-700 text-white",
    borderColor: "border-amber-100 dark:border-amber-900/50",
    IconComponent: AlertCircle,
  },
  info: {
    bgColor: "bg-blue-50/50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    buttonColor: "bg-blue-600 hover:bg-blue-700 text-white",
    borderColor: "border-blue-100 dark:border-blue-900/50",
    IconComponent: Info,
  },
  success: {
    bgColor: "bg-emerald-50/50 dark:bg-emerald-900/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    borderColor: "border-emerald-100 dark:border-emerald-900/50",
    IconComponent: CheckCircle2,
  },
};

const ICON_OPTIONS = [
  { id: "", label: "-- Không dùng Icon --" },
  { id: "ExternalLink", label: "Link ngoài (ExternalLink)" },
  { id: "Check", label: "Dấu tích (Check)" },
  { id: "Download", label: "Tải về (Download)" },
  { id: "RefreshCw", label: "Làm mới (RefreshCw)" },
  { id: "ArrowRight", label: "Mũi tên (ArrowRight)" },
  { id: "Shield", label: "Bảo vệ (Shield)" },
  { id: "Send", label: "Gửi đi (Send)" },
  { id: "Star", label: "Ngôi sao (Star)" },
  { id: "Gift", label: "Quà tặng (Gift)" },
  { id: "Sparkles", label: "Lấp lánh (Sparkles)" },
];

const COLOR_OPTIONS = [
  { id: "blue", label: "Xanh dương (Blue)" },
  { id: "red", label: "Đỏ cảnh báo (Red)" },
  { id: "amber", label: "Vàng cam (Amber)" },
  { id: "emerald", label: "Xanh lá (Emerald)" },
  { id: "purple", label: "Tím (Purple)" },
  { id: "gray", label: "Xám tối (Gray)" },
  { id: "outline", label: "Trắng viền (Outline)" },
];

const SIZE_OPTIONS = [
  { id: "sm", label: "Small (Nhỏ - 384px)" },
  { id: "md", label: "Medium (Vừa - 448px)" },
  { id: "lg", label: "Large (Lớn - 512px)" },
  { id: "xl", label: "Extra Large (Rộng - 576px)" },
  { id: "2xl", label: "2XL (672px)" },
  { id: "3xl", label: "3XL (768px)" },
  { id: "4xl", label: "4XL (896px)" },
  { id: "full", label: "Full Screen (Toàn màn hình)" },
];

const CreateNotification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isHtml: false,
    customCss: "",
    type: "info",
    displayType: "both",
    targetType: "all",
    targetValuesStr: "",
    scheduledAt: "",
    modalOptions: {
      size: "md",
      image: "",
      showCloseButton: true,
      actions: [
        {
          id: "btn-1",
          label: "Đồng ý",
          color: "blue",
          icon: "",
          actionType: "close",
          url: "",
        },
      ],
      hasForm: false,
      formFields: [],
    },
  });

  useEffect(() => {
    const fetchTpls = async () => {
      try {
        const res = await getTemplates();
        if (res.success) setTemplates(res.data || []);
      } catch (err) {}
    };
    fetchTpls();

    if (location.state?.template) {
      applyTemplate(location.state.template);
    }
  }, [location.state]);

  const applyTemplate = (tpl) => {
    setFormData((prev) => ({
      ...prev,
      title: tpl.title || "",
      content: tpl.content || "",
      isHtml: tpl.isHtml || false,
      customCss: tpl.customCss || "",
      type: tpl.type || "info",
      displayType: tpl.displayType || "both",
      modalOptions: {
        size: tpl.modalOptions?.size || "md",
        image: tpl.modalOptions?.image || "",
        showCloseButton: tpl.modalOptions?.showCloseButton ?? true,
        actions: tpl.modalOptions?.actions?.length
          ? tpl.modalOptions.actions
          : [
              {
                id: "btn-1",
                label: "Đồng ý",
                color: "blue",
                icon: "",
                actionType: "close",
                url: "",
              },
            ],
        hasForm: tpl.modalOptions?.hasForm || false,
        formFields: tpl.modalOptions?.formFields || [],
      },
    }));
    toast.success(`Đã áp dụng mẫu "${tpl.name}"`);
  };

  const handleSelectTemplate = (e) => {
    const tplId = e.target.value;
    if (!tplId) return;
    const tpl = templates.find((t) => t._id === tplId);
    if (tpl) applyTemplate(tpl);
  };

  // Upload Image File
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const bodyData = new FormData();
    bodyData.append("image", file);

    try {
      setUploadingImg(true);
      const res = await uploadModalImage(bodyData);
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          modalOptions: { ...prev.modalOptions, image: res.url },
        }));
        toast.success("Tải ảnh minh họa thành công");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tải ảnh");
    } finally {
      setUploadingImg(false);
    }
  };

  // Handle HTML File Upload
  const handleHtmlFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (text) {
        setFormData((prev) => ({
          ...prev,
          content: text.toString(),
          isHtml: true,
        }));
        toast.success("Đã đọc file HTML");
      }
    };
    reader.readAsText(file);
  };

  // Handle CSS File Upload
  const handleCssFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (text) {
        setFormData((prev) => ({
          ...prev,
          customCss: text.toString(),
        }));
        toast.success("Đã đọc file CSS");
      }
    };
    reader.readAsText(file);
  };

  // Dynamic Actions Handlers
  const handleAddAction = () => {
    const newAction = {
      id: "btn-" + Date.now(),
      label: "Nút mới",
      color: "blue",
      icon: "",
      actionType: "close",
      url: "",
    };
    setFormData((prev) => ({
      ...prev,
      modalOptions: {
        ...prev.modalOptions,
        actions: [...prev.modalOptions.actions, newAction],
      },
    }));
  };

  const handleUpdateAction = (index, field, value) => {
    setFormData((prev) => {
      const newActions = [...prev.modalOptions.actions];
      newActions[index] = { ...newActions[index], [field]: value };
      return {
        ...prev,
        modalOptions: { ...prev.modalOptions, actions: newActions },
      };
    });
  };

  const handleRemoveAction = (index) => {
    setFormData((prev) => {
      const newActions = prev.modalOptions.actions.filter((_, i) => i !== index);
      return {
        ...prev,
        modalOptions: { ...prev.modalOptions, actions: newActions },
      };
    });
  };

  // Dynamic Form Builder Handlers
  const handleAddFormField = () => {
    const newField = {
      id: "field-" + Date.now(),
      label: "Câu hỏi / Trường nhập mới",
      type: "text",
      placeholder: "Nhập nội dung...",
      required: false,
      options: [],
    };
    setFormData((prev) => ({
      ...prev,
      modalOptions: {
        ...prev.modalOptions,
        formFields: [...prev.modalOptions.formFields, newField],
      },
    }));
  };

  const handleUpdateFormField = (index, field, value) => {
    setFormData((prev) => {
      const newFields = [...prev.modalOptions.formFields];
      newFields[index] = { ...newFields[index], [field]: value };
      return {
        ...prev,
        modalOptions: { ...prev.modalOptions, formFields: newFields },
      };
    });
  };

  const handleRemoveFormField = (index) => {
    setFormData((prev) => {
      const newFields = prev.modalOptions.formFields.filter((_, i) => i !== index);
      return {
        ...prev,
        modalOptions: { ...prev.modalOptions, formFields: newFields },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng nhập đầy đủ Tiêu đề và Nội dung thông báo");
      return;
    }

    const payload = {
      title: formData.title,
      content: formData.content,
      isHtml: formData.isHtml,
      customCss: formData.customCss,
      type: formData.type,
      displayType: formData.displayType,
      targetType: formData.targetType,
      targetValues: formData.targetValuesStr
        ? formData.targetValuesStr.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      modalOptions: formData.modalOptions,
      scheduledAt: isScheduled && formData.scheduledAt ? formData.scheduledAt : null,
    };

    try {
      setLoading(true);
      const res = await sendBroadcast(payload);
      if (res.success) {
        toast.success(res.message || "Đã gửi thông báo hệ thống thành công!");
        navigate("/admin/notifications/history");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi phát thông báo");
    } finally {
      setLoading(false);
    }
  };

  const currentTheme = TYPE_THEMES[formData.type] || TYPE_THEMES.info;
  const PreviewIcon = currentTheme.IconComponent;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Send className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Tạo & Gửi Thông Báo Hệ Thống
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Hỗ trợ số lượng Nút bấm tùy ý, Tải file ảnh/HTML/CSS, Mở rộng size và Bộ dựng Form tương tác.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Quick Select Template */}
          {templates.length > 0 && (
            <div className="bg-blue-50/60 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-300">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Nạp từ Mẫu có sẵn:</span>
              </div>
              <select
                onChange={handleSelectTemplate}
                defaultValue=""
                className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-blue-300 dark:border-blue-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="" disabled>
                  -- Chọn mẫu thông báo --
                </option>
                {templates.map((tpl) => (
                  <option key={tpl._id} value={tpl._id}>
                    {tpl.name} ({tpl.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Form Box */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 shadow-xs">
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Thông tin nội dung thông báo
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Tiêu đề thông báo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Cập nhật điều khoản sử dụng mới"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Content Mode Selection (Text vs HTML/CSS) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>

                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isHtml: false })}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      !formData.isHtml
                        ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-white shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    }`}
                  >
                    Văn bản thường
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isHtml: true })}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      formData.isHtml
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Mã HTML & CSS
                  </button>
                </div>
              </div>

              {formData.isHtml ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-xl cursor-pointer">
                      <FileCode className="w-4 h-4 text-blue-600" />
                      Tải file .html
                      <input
                        type="file"
                        accept=".html,.txt"
                        onChange={handleHtmlFileChange}
                        className="hidden"
                      />
                    </label>

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-medium text-neutral-700 dark:text-neutral-300 rounded-xl cursor-pointer">
                      <Palette className="w-4 h-4 text-purple-600" />
                      Tải file .css
                      <input
                        type="file"
                        accept=".css"
                        onChange={handleCssFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-neutral-500 mb-1">
                      Mã HTML nội dung:
                    </span>
                    <textarea
                      rows={5}
                      placeholder="<h3>Xin chào {{username}}</h3><p>Nhập mã HTML vào đây...</p>"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 text-green-400 font-mono border border-neutral-700 rounded-xl text-xs focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-neutral-500 mb-1">
                      Mã CSS tùy biến:
                    </span>
                    <textarea
                      rows={3}
                      placeholder=".system-modal-container { border-radius: 24px; }"
                      value={formData.customCss}
                      onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 text-purple-400 font-mono border border-neutral-700 rounded-xl text-xs focus:outline-none resize-none"
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  rows={4}
                  placeholder="Nhập chi tiết nội dung muốn thông báo tới người dùng..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              )}
            </div>

            {/* Theme & Display Channel & Size */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Loại thông báo (Icon theme)
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs"
                >
                  <option value="info">Info - Xanh dương</option>
                  <option value="warning">Warning - Vàng cam</option>
                  <option value="danger">Danger - Nguy hiểm (Đỏ)</option>
                  <option value="lock">Lock - Khóa tài khoản</option>
                  <option value="success">Success - Xanh lá</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Kênh hiển thị
                </label>
                <select
                  value={formData.displayType}
                  onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs"
                >
                  <option value="both">Cả Feed & Pop-up Modal</option>
                  <option value="modal">Chỉ Pop-up Modal khẩn cấp</option>
                  <option value="feed">Chỉ Chuông Feed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
                  Kích thước Modal
                </label>
                <select
                  value={formData.modalOptions.size}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      modalOptions: { ...formData.modalOptions, size: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs"
                >
                  {SIZE_OPTIONS.map((sz) => (
                    <option key={sz.id} value={sz.id}>
                      {sz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload Option */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Ảnh minh họa Popup
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="w-full sm:w-auto px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-medium rounded-xl text-xs border border-blue-200 flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {uploadingImg ? "Đang tải ảnh lên..." : "Tải ảnh từ máy tính"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    disabled={uploadingImg}
                  />
                </label>

                <span className="text-xs text-neutral-400">hoặc</span>

                <input
                  type="text"
                  placeholder="Dán URL ảnh minh họa (https://...)"
                  value={formData.modalOptions.image}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      modalOptions: { ...formData.modalOptions, image: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs"
                />
              </div>

              {formData.modalOptions.image && (
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={formData.modalOptions.image}
                    alt="Uploaded preview"
                    className="h-12 w-20 object-cover rounded-lg border border-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        modalOptions: { ...formData.modalOptions, image: "" },
                      })
                    }
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Xóa ảnh
                  </button>
                </div>
              )}
            </div>

            {/* DYNAMIC BUTTONS LIST MANAGER (N-BUTTONS) */}
            {(formData.displayType === "modal" || formData.displayType === "both") && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-purple-600" />
                    Quản lý Nút bấm động ({formData.modalOptions.actions.length} nút)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm nút bấm mới
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.modalOptions.actions.map((act, index) => (
                    <div
                      key={act.id || index}
                      className="p-4 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
                          Nút #{index + 1}
                        </span>
                        {formData.modalOptions.actions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAction(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Xóa nút này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-neutral-500 mb-1">Tên nút</label>
                          <input
                            type="text"
                            value={act.label}
                            onChange={(e) => handleUpdateAction(index, "label", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-neutral-500 mb-1">Loại hành động</label>
                          <select
                            value={act.actionType || "close"}
                            onChange={(e) => handleUpdateAction(index, "actionType", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                          >
                            <option value="close">Đóng Popup (Close Modal)</option>
                            <option value="redirect">Chuyển đường dẫn (Redirect URL)</option>
                            <option value="submit_form">Gửi Form tương tác (Submit Form)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-neutral-500 mb-1">Màu nút</label>
                          <select
                            value={act.color}
                            onChange={(e) => handleUpdateAction(index, "color", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                          >
                            {COLOR_OPTIONS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-neutral-500 mb-1">Icon đính kèm</label>
                          <select
                            value={act.icon}
                            onChange={(e) => handleUpdateAction(index, "icon", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                          >
                            {ICON_OPTIONS.map((ic) => (
                              <option key={ic.id} value={ic.id}>
                                {ic.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {act.actionType === "redirect" && (
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] text-neutral-500 mb-1">Link chuyển hướng (URL)</label>
                            <input
                              type="text"
                              placeholder="VD: /appeals hoặc https://..."
                              value={act.url}
                              onChange={(e) => handleUpdateAction(index, "url", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORM BUILDER SECTION (INTERACTIVE INPUT FIELDS) */}
            {(formData.displayType === "modal" || formData.displayType === "both") && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    <input
                      type="checkbox"
                      checked={formData.modalOptions.hasForm}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          modalOptions: {
                            ...formData.modalOptions,
                            hasForm: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <FormInput className="w-4 h-4 text-emerald-600" />
                    Đính kèm Form tương tác nhập liệu trong Modal
                  </label>

                  {formData.modalOptions.hasForm && (
                    <button
                      type="button"
                      onClick={handleAddFormField}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm ô nhập
                    </button>
                  )}
                </div>

                {formData.modalOptions.hasForm && (
                  <div className="space-y-3">
                    {formData.modalOptions.formFields.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic">
                        Chưa có ô nhập liệu nào. Nhấn "+ Thêm ô nhập" để tạo.
                      </p>
                    ) : (
                      formData.modalOptions.formFields.map((fld, fIdx) => (
                        <div
                          key={fld.id || fIdx}
                          className="p-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-2 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-600">
                              Trường #{fIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFormField(fIdx)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-neutral-500">Tên câu hỏi / Label</label>
                              <input
                                type="text"
                                value={fld.label}
                                onChange={(e) => handleUpdateFormField(fIdx, "label", e.target.value)}
                                className="w-full px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-neutral-500">Kiểu ô nhập</label>
                              <select
                                value={fld.type}
                                onChange={(e) => handleUpdateFormField(fIdx, "type", e.target.value)}
                                className="w-full px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs"
                              >
                                <option value="text">Văn bản ngắn (Input Text)</option>
                                <option value="textarea">Văn bản dài (Textarea)</option>
                                <option value="select">Dropdown chọn lựa (Select)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-neutral-500">Bắt buộc</label>
                              <select
                                value={fld.required ? "true" : "false"}
                                onChange={(e) =>
                                  handleUpdateFormField(fIdx, "required", e.target.value === "true")
                                }
                                className="w-full px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs"
                              >
                                <option value="false">Không bắt buộc</option>
                                <option value="true">Bắt buộc nhập</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Audience Section */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
              <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Đối tượng nhận (Target Audience)
              </h4>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "all", label: "Tất cả User" },
                  { id: "role", label: "Theo Vai trò" },
                  { id: "users", label: "Danh sách UID" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetType: opt.id })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      formData.targetType === opt.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {formData.targetType === "role" && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Nhập danh sách Role (phân cách bởi dấu phẩy):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: USER, ADMIN"
                    value={formData.targetValuesStr}
                    onChange={(e) => setFormData({ ...formData, targetValuesStr: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs"
                  />
                </div>
              )}

              {formData.targetType === "users" && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Nhập User IDs (phân cách bởi dấu phẩy):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="VD: 60d5ecb8b5c0c82b1029381a, 60d5ecb8b5c0c82b1029381b"
                    value={formData.targetValuesStr}
                    onChange={(e) => setFormData({ ...formData, targetValuesStr: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs resize-none"
                  />
                </div>
              )}
            </div>

            {/* Schedule Option */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <Clock className="w-4 h-4 text-neutral-500" />
                Lên lịch gửi sau
              </label>

              {isScheduled && (
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-5 h-5" />
              {loading ? "Đang gửi..." : isScheduled ? "Xác nhận lên lịch gửi" : "Phát thông báo ngay"}
            </button>
          </div>
        </form>

        {/* Live SystemModal Preview Column */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" />
              Xem trước giao diện (Live Preview)
            </span>
            <span className="text-[11px] text-neutral-400 font-normal">
              Size: {formData.modalOptions.size}
            </span>
          </div>

          {/* Canvas Preview Box */}
          <div className="bg-neutral-900/90 dark:bg-black/80 p-6 rounded-3xl min-h-[460px] flex items-center justify-center border border-neutral-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-3 left-4 text-[10px] text-neutral-500 font-mono">
              PREVIEW: SystemModal.jsx
            </div>

            {formData.customCss && <style>{formData.customCss}</style>}

            {/* Simulated SystemModal */}
            <div
              className={`w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border ${currentTheme.borderColor} overflow-hidden transform transition-all p-6 text-center system-modal-container`}
              style={{
                maxWidth:
                  formData.modalOptions.size === "sm"
                    ? "384px"
                    : formData.modalOptions.size === "md"
                    ? "448px"
                    : formData.modalOptions.size === "lg"
                    ? "512px"
                    : formData.modalOptions.size === "xl"
                    ? "576px"
                    : formData.modalOptions.size === "2xl"
                    ? "672px"
                    : formData.modalOptions.size === "3xl"
                    ? "768px"
                    : formData.modalOptions.size === "4xl"
                    ? "896px"
                    : "95%",
              }}
            >
              {/* Top Close Button */}
              {formData.modalOptions.showCloseButton && (
                <div className="flex justify-end -mt-2 -mr-2 mb-1">
                  <span className="text-neutral-400 p-1 rounded-full cursor-not-allowed">
                    <X className="w-4 h-4" />
                  </span>
                </div>
              )}

              {/* Illustration Image */}
              {formData.modalOptions.image ? (
                <div className="mb-4 max-w-full overflow-hidden rounded-xl">
                  <img
                    src={formData.modalOptions.image}
                    alt="preview"
                    className="w-full max-h-48 object-contain mx-auto"
                  />
                </div>
              ) : (
                PreviewIcon && (
                  <div
                    className={`p-3.5 rounded-full ${currentTheme.iconBg} ${currentTheme.iconColor} mb-4 inline-block`}
                  >
                    <PreviewIcon className="w-8 h-8 mx-auto" />
                  </div>
                )
              )}

              {/* Title */}
              <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2">
                {formData.title || "Tiêu đề mẫu thông báo"}
              </h3>

              {/* Message */}
              {formData.isHtml ? (
                <div
                  className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed mb-6 w-full text-left system-modal-html-content"
                  dangerouslySetInnerHTML={{
                    __html: formData.content || "<p>Nội dung HTML xem trước...</p>",
                  }}
                />
              ) : (
                <div className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed mb-6 whitespace-pre-line max-w-xs mx-auto">
                  {formData.content || "Nội dung chi tiết của thông báo sẽ hiển thị ở đây..."}
                </div>
              )}

              {/* Form Fields Preview */}
              {formData.modalOptions.hasForm && formData.modalOptions.formFields.length > 0 && (
                <div className="w-full mb-6 text-left bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2">
                  {formData.modalOptions.formFields.map((f, i) => (
                    <div key={i}>
                      <span className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
                        {f.label} {f.required && <span className="text-red-500">*</span>}
                      </span>
                      <input
                        type="text"
                        disabled
                        placeholder={f.placeholder || "Nơi người dùng nhập liệu..."}
                        className="w-full px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs cursor-not-allowed opacity-70"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons List (N-Buttons) */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full justify-center">
                {formData.modalOptions.actions.map((act, idx) => {
                  const ActIconComp = act.icon ? ICON_MAP[act.icon] : null;
                  const colorClass = BUTTON_COLOR_MAP[act.color] || BUTTON_COLOR_MAP.blue;
                  return (
                    <button
                      key={act.id || idx}
                      type="button"
                      className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 ${colorClass}`}
                    >
                      {ActIconComp && <ActIconComp className="w-3.5 h-3.5" />}
                      <span>{act.label || "Nút bấm"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNotification;
