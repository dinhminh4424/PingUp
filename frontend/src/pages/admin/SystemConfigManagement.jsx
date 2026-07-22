import React, { useEffect, useState } from "react";
import { 
  Settings, 
  ShieldCheck, 
  HardDrive, 
  Sliders, 
  History, 
  Save, 
  RotateCcw,
  User,
  Clock,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Globe
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  getAdminConfigs, 
  updateAdminConfigsBatch, 
  getConfigHistory,
  uploadConfigImage as uploadConfigImageService
} from "../../services/admin/SystemConfigService";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const SystemConfigManagement = () => {
  const { refreshSystemConfigs } = useAuth();
  const [activeTab, setActiveTab] = useState("settings"); // "settings" | "history"
  const [activeSubTab, setActiveSubTab] = useState("general"); // "general" | "auth" | "media" | "features"
  
  // States cho cấu hình
  const [configs, setConfigs] = useState([]);
  const [originalConfigs, setOriginalConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKeys, setUploadingKeys] = useState({});

  const handleFileUpload = async (key, file) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Dung lượng tệp vượt quá giới hạn 4MB.");
      return;
    }
    setUploadingKeys((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await uploadConfigImageService(file);
      if (res.success && res.url) {
        handleValueChange(key, res.url);
        toast.success("Tải tệp tin lên thành công!");
      } else {
        toast.error("Tải tệp tin lên thất bại.");
      }
    } catch (err) {
      console.error("Lỗi uploadConfigImage:", err);
      toast.error(err.response?.data?.message || "Lỗi khi tải tệp lên.");
    } finally {
      setUploadingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  // States cho lịch sử
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);

  // States cho modal xác nhận thay đổi (Diff Modal)
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [changesToConfirm, setChangesToConfirm] = useState([]);

  // Fetch all configs
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await getAdminConfigs();
      if (res.success) {
        setConfigs(res.data || []);
        // Sao chép sâu (deep copy) để đối chiếu thay đổi
        setOriginalConfigs(JSON.parse(JSON.stringify(res.data || [])));
      }
    } catch (error) {
      console.error("Lỗi fetchConfigs:", error);
      toast.error("Không thể tải cấu hình hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch history logs
  const fetchHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await getConfigHistory(page, 10);
      if (res.success) {
        setHistoryLogs(res.data || []);
        setHistoryPages(res.pagination?.pages || 1);
        setHistoryPage(res.pagination?.page || 1);
      }
    } catch (error) {
      console.error("Lỗi fetchHistory:", error);
      toast.error("Không thể tải lịch sử thay đổi cấu hình.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory(1);
    }
  }, [activeTab]);

  // Xử lý thay đổi giá trị cấu hình trên UI
  const handleValueChange = (key, newValue) => {
    setConfigs(prev => 
      prev.map(item => item.key === key ? { ...item, value: newValue } : item)
    );
  };

  // Trả cấu hình về giá trị ban đầu (Reset)
  const handleResetCurrentSubTab = () => {
    const currentSubTabKeys = configs
      .filter(c => c.group === activeSubTab)
      .map(c => c.key);

    setConfigs(prev => 
      prev.map(item => {
        if (currentSubTabKeys.includes(item.key)) {
          const original = originalConfigs.find(o => o.key === item.key);
          return original ? { ...item, value: original.value } : item;
        }
        return item;
      })
    );
    toast.success("Đã hoàn tác các thay đổi chưa lưu của mục này.");
  };

  // Xác định các thay đổi thực tế so với DB
  const getDirtyConfigs = () => {
    const changes = [];
    configs.forEach(item => {
      const original = originalConfigs.find(o => o.key === item.key);
      if (original) {
        const currentValStr = JSON.stringify(item.value);
        const originalValStr = JSON.stringify(original.value);
        if (currentValStr !== originalValStr) {
          changes.push({
            key: item.key,
            label: item.label,
            type: item.type,
            oldValue: original.value,
            newValue: item.value
          });
        }
      }
    });
    return changes;
  };

  // Nhấn "Lưu cấu hình" -> Kiểm tra và hiển thị Dialog
  const handlePreSave = () => {
    const dirty = getDirtyConfigs();
    if (dirty.length === 0) {
      toast.error("Không có cấu hình nào thay đổi so với hiện tại.");
      return;
    }
    setChangesToConfirm(dirty);
    setIsDiffModalOpen(true);
  };

  // Xác nhận lưu từ Dialog
  const handleConfirmSave = async () => {
    setIsDiffModalOpen(false);
    setSaving(true);
    try {
      const updates = changesToConfirm.map(c => ({ key: c.key, value: c.newValue }));
      const res = await updateAdminConfigsBatch(updates);
      if (res.success) {
        toast.success(res.message || "Cập nhật cấu hình thành công!");
        await fetchConfigs();
        await refreshSystemConfigs();
      }
    } catch (error) {
      console.error("Lỗi khi lưu cấu hình:", error);
      toast.error("Gặp lỗi trong quá trình lưu cấu hình.");
    } finally {
      setSaving(false);
    }
  };

  // Render các loại Input khác nhau dựa trên `type` của cấu hình
  const renderConfigInput = (config) => {
    switch (config.type) {
      case "boolean":
        return (
          <button
            onClick={() => handleValueChange(config.key, !config.value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ${
              config.value ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${
                config.value ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        );

      case "number":
        return (
          <Input
            type="number"
            value={config.value}
            onChange={(e) => handleValueChange(config.key, Number(e.target.value))}
            className="max-w-md bg-white dark:bg-gray-950 font-medium"
          />
        );

      case "select":
        return (
          <select
            value={config.value}
            onChange={(e) => handleValueChange(config.key, e.target.value)}
            className="w-full max-w-md h-10 px-3 rounded-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 text-sm font-medium focus:ring-1 focus:ring-indigo-500"
          >
            {config.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "string":
      default:
        // Nếu là trường chứa ảnh/logo/background
        if (config.key.endsWith("_url") || config.key.includes("image")) {
          const isUploading = uploadingKeys[config.key];
          return (
            <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-md">
              {/* Preview */}
              <div className="size-16 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden shrink-0">
                {config.value ? (
                  <img src={config.value} alt="Preview" className="size-full object-contain" />
                ) : (
                  <span className="text-[10px] text-gray-400">Chưa có ảnh</span>
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <Input
                  type="text"
                  value={config.value}
                  onChange={(e) => handleValueChange(config.key, e.target.value)}
                  placeholder="Nhập URL ảnh hoặc chọn file tải lên..."
                  className="bg-white dark:bg-gray-950 font-medium text-xs"
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <span className={`px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploading ? "Đang tải lên..." : "Chọn ảnh tải lên"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(config.key, e.target.files[0])}
                      disabled={isUploading}
                    />
                  </label>
                  {config.value && (
                    <button
                      onClick={() => handleValueChange(config.key, "")}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }
        return (
          <Input
            type="text"
            value={config.value}
            onChange={(e) => handleValueChange(config.key, e.target.value)}
            className="max-w-md bg-white dark:bg-gray-950 font-medium"
          />
        );
    }
  };

  // Dịch giá trị boolean/phức tạp để hiển thị trên bảng so sánh
  const formatDiffValue = (val, type) => {
    if (type === "boolean") {
      return val ? (
        <span className="px-2 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded dark:bg-emerald-900/30 dark:text-emerald-400">BẬT</span>
      ) : (
        <span className="px-2 py-0.5 text-xs font-semibold text-rose-700 bg-rose-100 rounded dark:bg-rose-900/30 dark:text-rose-400">TẮT</span>
      );
    }
    return String(val);
  };

  const getSubTabIcon = (group) => {
    switch (group) {
      case "general": return <Settings className="size-4 mr-2" />;
      case "auth": return <ShieldCheck className="size-4 mr-2" />;
      case "media": return <HardDrive className="size-4 mr-2" />;
      case "features": return <Sliders className="size-4 mr-2" />;
      default: return <Settings className="size-4 mr-2" />;
    }
  };

  const getSubTabLabel = (group) => {
    switch (group) {
      case "general": return "Chung";
      case "auth": return "Đăng ký & Bảo mật";
      case "media": return "Dung lượng & Tệp tin";
      case "features": return "Tính năng & Giới hạn";
      default: return group;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-gray-50 flex items-center">
            <Settings className="size-8 mr-3 text-indigo-600 animate-spin-slow" />
            Cấu hình hệ thống
          </h1>
          <p className="text-gray-500 mt-1 text-sm dark:text-gray-400">
            Quản lý các cài đặt toàn hệ thống PingUp, các tính năng hoạt động, giới hạn dung lượng tải lên.
          </p>
        </div>
      </div>

      {/* Tabs chính */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center ${
            activeTab === "settings"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 dark:hover:text-gray-100"
          }`}
        >
          <Sliders className="size-4 mr-2" />
          Tham số cấu hình
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 dark:hover:text-gray-100"
          }`}
        >
          <History className="size-4 mr-2" />
          Nhật ký thay đổi (Audit Log)
        </button>
      </div>

      {/* Tab: Cài đặt cấu hình */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sub-tabs menu bên trái */}
          <div className="space-y-1 lg:col-span-1">
            {["general", "auth", "media", "features"].map((g) => (
              <button
                key={g}
                onClick={() => setActiveSubTab(g)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center transition-all ${
                  activeSubTab === g
                    ? "bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
                }`}
              >
                {getSubTabIcon(g)}
                {getSubTabLabel(g)}
              </button>
            ))}
          </div>

          {/* Form cấu hình bên phải */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center text-gray-900 dark:text-gray-100">
                  {getSubTabIcon(activeSubTab)}
                  Thiết lập {getSubTabLabel(activeSubTab)}
                </CardTitle>
                <CardDescription>
                  Chỉnh sửa các giá trị cấu hình thuộc nhóm {getSubTabLabel(activeSubTab).toLowerCase()}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  // Skeleton Loading
                  <div className="space-y-6">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  configs
                    .filter((c) => c.group === activeSubTab)
                    .map((config, index, arr) => (
                      <div key={config.key} className="space-y-3">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-900 dark:text-gray-200 flex items-center">
                              {config.label}
                              {config.isPublic && (
                                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950 rounded">
                                  Công khai
                                </span>
                              )}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl">
                              {config.description}
                            </p>
                          </div>
                          <div className="w-full md:w-auto flex items-center justify-start md:justify-end">
                            {renderConfigInput(config)}
                          </div>
                        </div>
                        {index < arr.length - 1 && <Separator className="my-4 border-gray-100 dark:border-gray-900" />}
                      </div>
                    ))
                )}

                {/* Footer Buttons */}
                {!loading && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-900 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={handleResetCurrentSubTab}
                      disabled={saving}
                      className="border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                    >
                      <RotateCcw className="size-4 mr-2" />
                      Hoàn tác chưa lưu
                    </Button>
                    <Button
                      onClick={handlePreSave}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
                    >
                      <Save className="size-4 mr-2" />
                      Lưu cấu hình
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Nhật ký thay đổi (Audit Log) */}
      {activeTab === "history" && (
        <Card className="border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-gray-900 dark:text-gray-100">
              <History className="size-5 mr-2 text-indigo-600" />
              Lịch sử thay đổi hệ thống
            </CardTitle>
            <CardDescription>
              Xem nhật ký cập nhật cấu hình hệ thống thực hiện bởi các quản trị viên khác nhau.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-16 w-full" />
                ))}
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="text-center py-10">
                <AlertTriangle className="size-10 text-amber-500 mx-auto mb-2" />
                <p className="text-gray-500 font-medium dark:text-gray-400">Không tìm thấy bản ghi lịch sử nào.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {historyLogs.map((log, logIdx) => (
                      <li key={log._id}>
                        <div className="relative pb-8">
                          {logIdx !== historyLogs.length - 1 ? (
                            <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3 items-start">
                            {/* Avatar */}
                            <div className="relative">
                              {log.updatedBy?.profile_picture ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover ring-4 ring-white dark:ring-gray-950"
                                  src={log.updatedBy.profile_picture}
                                  alt={log.updatedBy.full_name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold ring-4 ring-white dark:ring-gray-950 border border-indigo-200 dark:border-indigo-900/30">
                                  {log.updatedBy?.full_name?.charAt(0) || <User className="size-4" />}
                                </div>
                              )}
                            </div>

                            {/* Nội dung hoạt động */}
                            <div className="flex-1 min-w-0 pt-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold text-gray-900 dark:text-gray-100 mr-1.5">
                                    {log.updatedBy?.full_name || "Quản trị viên ẩn danh"}
                                  </span>
                                  đã cập nhật cấu hình
                                  <span className="mx-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                    {log.label} ({log.key})
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                                  <Clock className="size-3" />
                                  {new Date(log.createdAt).toLocaleString("vi-VN")}
                                </div>
                              </div>

                              {/* Diff Details */}
                              <div className="mt-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Giá trị cũ</span>
                                  <div className="font-mono text-xs overflow-x-auto text-gray-600 dark:text-gray-400 max-w-full">
                                    {typeof log.oldValue === "boolean" ? (
                                      log.oldValue ? "BẬT (True)" : "TẮT (False)"
                                    ) : (
                                      JSON.stringify(log.oldValue)
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Giá trị mới</span>
                                  <div className="font-mono text-xs overflow-x-auto text-indigo-600 dark:text-indigo-400 font-bold max-w-full">
                                    {typeof log.newValue === "boolean" ? (
                                      log.newValue ? "BẬT (True)" : "TẮT (False)"
                                    ) : (
                                      JSON.stringify(log.newValue)
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Thiết bị / IP */}
                              <div className="mt-1 flex items-center gap-4 text-xs text-gray-400">
                                {log.ipAddress && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="size-3" />
                                    IP: {log.ipAddress}
                                  </span>
                                )}
                                {log.userAgent && (
                                  <span className="flex items-center gap-1 truncate max-w-xs md:max-w-md">
                                    <Laptop className="size-3" />
                                    {log.userAgent.length > 50 ? log.userAgent.slice(0, 50) + "..." : log.userAgent}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pagination */}
                {historyPages > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-900">
                    <Button
                      variant="outline"
                      disabled={historyPage === 1}
                      onClick={() => fetchHistory(historyPage - 1)}
                      className="border-gray-200 dark:border-gray-800"
                    >
                      Trang trước
                    </Button>
                    <span className="text-sm font-medium text-gray-500">
                      Trang {historyPage} / {historyPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={historyPage === historyPages}
                      onClick={() => fetchHistory(historyPage + 1)}
                      className="border-gray-200 dark:border-gray-800"
                    >
                      Trang sau
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog Xác nhận Thay đổi (Diff Modal) */}
      <Dialog open={isDiffModalOpen} onOpenChange={setIsDiffModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center text-amber-600 dark:text-amber-500">
              <AlertTriangle className="size-6 mr-2 animate-pulse" />
              Xác nhận lưu thay đổi cấu hình
            </DialogTitle>
            <DialogDescription>
              Vui lòng xem lại danh sách các tham số cấu hình hệ thống đã thay đổi dưới đây trước khi lưu vào Database.
            </DialogDescription>
          </DialogHeader>

          {/* Table Diff */}
          <div className="max-h-[300px] overflow-y-auto border border-gray-100 dark:border-gray-900 rounded-md">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Cấu hình</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Giá trị hiện tại (DB)</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Giá trị thay đổi mới</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {changesToConfirm.map((c) => (
                  <tr key={c.key} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-950 dark:text-gray-200">{c.label}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{c.key}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {formatDiffValue(c.oldValue, c.type)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/30 dark:bg-indigo-950/10">
                      {formatDiffValue(c.newValue, c.type)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDiffModalOpen(false)}
              className="border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 flex items-center"
            >
              <CheckCircle2 className="size-4 mr-2" />
              Đồng ý & Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemConfigManagement;
