import React, { useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import {
  Lock,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  ExternalLink,
  Check,
  Download,
  RefreshCw,
  ArrowRight,
  Shield,
  Send,
  Star,
  Gift,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export const ICON_MAP = {
  Lock,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  ExternalLink,
  Check,
  Download,
  RefreshCw,
  ArrowRight,
  Shield,
  Send,
  Star,
  Gift,
  Sparkles,
};

export const BUTTON_COLOR_MAP = {
  blue: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
  red: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  amber: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
  emerald: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
  purple: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500",
  gray: "bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white focus:ring-neutral-500",
  outline: "border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:ring-neutral-500",
};

const SystemModal = () => {
  const { systemModal, setSystemModal } = useSocket();
  const [active, setActive] = useState(false);
  const [formState, setFormState] = useState({});

  React.useEffect(() => {
    if (systemModal.open) {
      const timer = setTimeout(() => setActive(true), 10);
      return () => clearTimeout(timer);
    } else {
      setActive(false);
      setFormState({});
    }
  }, [systemModal.open]);

  if (!systemModal.open) return null;

  const {
    title,
    message,
    isHtml = false,
    customCss = "",
    type = "info",
    size = "md",
    image,
    showCloseButton = true,
    actions = [],
    primaryAction,
    secondaryAction,
    hasForm = false,
    formFields = [],
    onClose,
    onSubmitForm,
  } = systemModal;

  const handleClose = () => {
    setActive(false);
    setTimeout(() => {
      if (onClose && typeof onClose === "function") {
        onClose();
      }
      setSystemModal((prev) => ({ ...prev, open: false }));
    }, 150);
  };

  const handleInputChange = (fieldId, value) => {
    setFormState((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleActionClick = (action) => {
    const actionType = action.actionType || (action.url ? "redirect" : "close");

    if (actionType === "close") {
      if (action.onClick) action.onClick();
      handleClose();
    } else if (actionType === "redirect") {
      if (action.onClick) action.onClick();
      if (action.url) {
        if (action.url.startsWith("http")) window.open(action.url, "_blank");
        else window.location.href = action.url;
      }
      handleClose();
    } else if (actionType === "submit_form") {
      // Validate required fields
      for (const field of formFields) {
        if (field.required && !formState[field.id]) {
          toast.error(`Vui lòng điền trường: ${field.label}`);
          return;
        }
      }
      if (onSubmitForm && typeof onSubmitForm === "function") {
        onSubmitForm(formState);
      } else {
        toast.success("Đã gửi phản hồi thành công!");
      }
      handleClose();
    } else {
      if (action.onClick) action.onClick();
      handleClose();
    }
  };

  // Construct final actions list (supporting legacy primaryAction/secondaryAction fallback)
  let finalActions = Array.isArray(actions) && actions.length > 0 ? actions : [];
  if (finalActions.length === 0) {
    if (secondaryAction && secondaryAction.show !== false) {
      finalActions.push({ ...secondaryAction, actionType: secondaryAction.url ? "redirect" : "close" });
    }
    if (primaryAction && primaryAction.show !== false) {
      finalActions.push({ ...primaryAction, actionType: primaryAction.url ? "redirect" : "close" });
    }
  }

  // Size Tailwind classes
  const sizeClasses = {
    sm: "max-w-sm w-full",
    md: "max-w-md w-full",
    lg: "max-w-lg w-full",
    xl: "max-w-xl w-full",
    "2xl": "max-w-2xl w-full",
    "3xl": "max-w-3xl w-full",
    "4xl": "max-w-4xl w-full",
    full: "max-w-[95vw] w-full max-h-[92vh] overflow-y-auto",
  };

  // Theme Config
  const themeConfig = {
    lock: {
      bgColor: "bg-red-50/50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      borderColor: "border-red-100 dark:border-red-900/50",
      IconComponent: Lock,
    },
    danger: {
      bgColor: "bg-red-50/50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      borderColor: "border-red-100 dark:border-red-900/50",
      IconComponent: AlertTriangle,
    },
    warning: {
      bgColor: "bg-amber-50/50 dark:bg-amber-900/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      borderColor: "border-amber-100 dark:border-amber-900/50",
      IconComponent: AlertCircle,
    },
    info: {
      bgColor: "bg-blue-50/50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-100 dark:border-blue-900/50",
      IconComponent: Info,
    },
    success: {
      bgColor: "bg-emerald-50/50 dark:bg-emerald-900/15",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      borderColor: "border-emerald-100 dark:border-emerald-900/50",
      IconComponent: CheckCircle2,
    },
  };

  const currentTheme = themeConfig[type] || themeConfig.info;
  const ThemeIcon = currentTheme.IconComponent;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 transition-opacity duration-200 ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Custom CSS Injection */}
      {customCss && <style>{customCss}</style>}

      <div
        className={`${
          sizeClasses[size] || sizeClasses.md
        } bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border ${
          currentTheme.borderColor
        } overflow-hidden transform transition-all duration-200 system-modal-container ${
          active
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-98 opacity-0 translate-y-1"
        }`}
      >
        {/* Header bar / Close button */}
        <div className="flex justify-end p-4 pb-0">
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="px-6 pb-6 pt-2 flex flex-col items-center text-center">
          {/* Optional Illustration Image */}
          {image && (
            <div className="mb-5 max-w-full overflow-hidden rounded-xl shadow-xs">
              <img
                src={image}
                alt="modal-illustration"
                className="w-full max-h-60 object-contain mx-auto"
              />
            </div>
          )}

          {/* Theme Icon */}
          {!image && ThemeIcon && (
            <div
              className={`p-3.5 rounded-full ${currentTheme.iconBg} ${currentTheme.iconColor} mb-4`}
            >
              <ThemeIcon className="w-8 h-8" />
            </div>
          )}

          {/* Modal Title */}
          {title && (
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2.5">
              {title}
            </h3>
          )}

          {/* Message Body (HTML vs Text) */}
          {isHtml ? (
            <div
              className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-6 w-full text-left system-modal-html-content"
              dangerouslySetInnerHTML={{ __html: message }}
            />
          ) : (
            <div className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6 whitespace-pre-line max-w-md">
              {message}
            </div>
          )}

          {/* Embedded Interactive Form (if enabled) */}
          {hasForm && formFields.length > 0 && (
            <div className="w-full mb-6 text-left bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
              {formFields.map((field) => (
                <div key={field.id || field.label}>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder}
                      value={formState[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={formState[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                    >
                      <option value="">-- Chọn lựa chọn --</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formState[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions List (N Buttons) */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full justify-center">
            {finalActions.map((act, idx) => {
              const ActionIcon = act.icon ? ICON_MAP[act.icon] : null;
              const colorClass =
                BUTTON_COLOR_MAP[act.color] ||
                BUTTON_COLOR_MAP.blue;

              return (
                <button
                  key={act.id || idx}
                  type="button"
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-[120px] flex items-center justify-center gap-2 cursor-pointer ${colorClass}`}
                  onClick={() => handleActionClick(act)}
                >
                  {ActionIcon && <ActionIcon className="w-4 h-4" />}
                  <span>{act.label || "Nút bấm"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemModal;
