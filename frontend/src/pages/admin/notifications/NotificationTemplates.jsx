import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Send,
  Lock,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  uploadModalImage,
} from "../../../services/admin/SystemNotificationServices";

const TYPE_CONFIG = {
  info: { label: "Thông tin", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: Info },
  warning: { label: "Cảnh báo", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800", icon: AlertCircle },
  danger: { label: "Nguy hiểm", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800", icon: AlertTriangle },
  lock: { label: "Khóa TK", color: "bg-red-600/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800", icon: Lock },
  success: { label: "Thành công", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
};

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

const NotificationTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    content: "",
    isHtml: false,
    customCss: "",
    type: "info",
    displayType: "both",
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

  const fetchTemplatesData = async () => {
    try {
      setLoading(true);
      const res = await getTemplates();
      if (res.success) {
        setTemplates(res.data || []);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách mẫu thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplatesData();
  }, []);

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name || "",
        title: template.title || "",
        content: template.content || "",
        isHtml: template.isHtml || false,
        customCss: template.customCss || "",
        type: template.type || "info",
        displayType: template.displayType || "both",
        modalOptions: {
          size: template.modalOptions?.size || "md",
          image: template.modalOptions?.image || "",
          showCloseButton: template.modalOptions?.showCloseButton ?? true,
          actions: template.modalOptions?.actions?.length
            ? template.modalOptions.actions
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
          hasForm: template.modalOptions?.hasForm || false,
          formFields: template.modalOptions?.formFields || [],
        },
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        title: "",
        content: "",
        isHtml: false,
        customCss: "",
        type: "info",
        displayType: "both",
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
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleAddAction = () => {
    setFormData((prev) => ({
      ...prev,
      modalOptions: {
        ...prev.modalOptions,
        actions: [
          ...prev.modalOptions.actions,
          {
            id: "btn-" + Date.now(),
            label: "Nút mới",
            color: "blue",
            icon: "",
            actionType: "close",
            url: "",
          },
        ],
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
    setFormData((prev) => ({
      ...prev,
      modalOptions: {
        ...prev.modalOptions,
        actions: prev.modalOptions.actions.filter((_, i) => i !== index),
      },
    }));
  };

  const handleImageUpload = async (e) => {
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
      toast.error("Lỗi khi tải ảnh");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng điền đầy đủ Tên mẫu, Tiêu đề và Nội dung");
      return;
    }

    try {
      if (editingTemplate) {
        const res = await updateTemplate(editingTemplate._id, formData);
        if (res.success) {
          toast.success("Cập nhật mẫu thành công");
          fetchTemplatesData();
          handleCloseModal();
        }
      } else {
        const res = await createTemplate(formData);
        if (res.success) {
          toast.success("Tạo mẫu thông báo thành công");
          fetchTemplatesData();
          handleCloseModal();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xử lý mẫu thông báo");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mẫu thông báo này?")) return;
    try {
      const res = await deleteTemplate(id);
      if (res.success) {
        toast.success("Đã xóa mẫu thông báo");
        setTemplates((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (error) {
      toast.error("Không thể xóa mẫu thông báo");
    }
  };

  const handleUseTemplate = (template) => {
    navigate("/admin/notifications/create", { state: { template } });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Mẫu Thông Báo Hệ Thống
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Quản lý mẫu thông báo linh hoạt với số lượng Nút bấm tùy ý và Form tương tác mở rộng.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Tạo mẫu mới
        </button>
      </div>

      {/* Grid Templates */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8">
          <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            Chưa có mẫu thông báo nào
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
            Tạo mẫu thông báo sẵn để giúp việc phát cảnh báo, bảo trì hoặc thông báo tính năng nhanh chóng hơn.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl text-sm hover:bg-blue-700 cursor-pointer"
          >
            Tạo mẫu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => {
            const typeInfo = TYPE_CONFIG[tpl.type] || TYPE_CONFIG.info;
            const Icon = typeInfo.icon;
            const actionCount = tpl.modalOptions?.actions?.length || 1;
            return (
              <div
                key={tpl._id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-bold text-neutral-900 dark:text-white truncate">
                      {tpl.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${typeInfo.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {typeInfo.label}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1 line-clamp-1">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-4 leading-relaxed whitespace-pre-line">
                    {tpl.isHtml ? "[Mã HTML Custom]" : tpl.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {actionCount} Nút bấm • Size: {tpl.modalOptions?.size || "md"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(tpl._id)}
                      className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      title="Xóa mẫu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(tpl)}
                      className="p-2 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      title="Chỉnh sửa mẫu"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUseTemplate(tpl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Dùng gửi
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {editingTemplate ? "Chỉnh sửa mẫu thông báo" : "Tạo mẫu thông báo mới"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tên mẫu thông báo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Cảnh báo nâng cấp hệ thống"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Loại thông báo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="danger">Danger</option>
                    <option value="lock">Lock</option>
                    <option value="success">Success</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kênh hiển thị
                  </label>
                  <select
                    value={formData.displayType}
                    onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs"
                  >
                    <option value="both">Feed & Modal</option>
                    <option value="modal">Chỉ Modal</option>
                    <option value="feed">Chỉ Feed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Size Modal
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

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tiêu đề hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Thông báo bảo trì"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Nội dung chi tiết <span className="text-red-500">*</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-blue-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isHtml}
                      onChange={(e) => setFormData({ ...formData, isHtml: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    Dùng mã HTML
                  </label>
                </div>

                <textarea
                  rows={4}
                  placeholder="Nhập nội dung thông báo..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs resize-none ${
                    formData.isHtml ? "font-mono text-green-600 bg-neutral-900" : ""
                  }`}
                />
              </div>

              {/* Dynamic Actions List in Template */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase">
                    Quản lý Nút bấm động ({formData.modalOptions.actions.length} nút)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    + Thêm nút
                  </button>
                </div>

                {formData.modalOptions.actions.map((act, index) => (
                  <div key={act.id || index} className="grid grid-cols-3 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Tên nút"
                      value={act.label}
                      onChange={(e) => handleUpdateAction(index, "label", e.target.value)}
                      className="px-2.5 py-1 bg-white dark:bg-neutral-800 border rounded text-xs"
                    />
                    <select
                      value={act.color}
                      onChange={(e) => handleUpdateAction(index, "color", e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-neutral-800 border rounded text-xs"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <select
                        value={act.actionType || "close"}
                        onChange={(e) => handleUpdateAction(index, "actionType", e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-neutral-800 border rounded text-xs"
                      >
                        <option value="close">Đóng Modal</option>
                        <option value="redirect">Link URL</option>
                        <option value="submit_form">Gửi Form</option>
                      </select>
                      {formData.modalOptions.actions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAction(index)}
                          className="p-1 text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingTemplate ? "Lưu thay đổi" : "Tạo mẫu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplates;
