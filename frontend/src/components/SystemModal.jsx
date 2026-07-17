import React from "react";
import { useSocket } from "../contexts/SocketContext";
import {
  Lock,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";

const SystemModal = () => {
  const { systemModal, setSystemModal } = useSocket();
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    if (systemModal.open) {
      const timer = setTimeout(() => setActive(true), 10);
      return () => clearTimeout(timer);
    } else {
      setActive(false);
    }
  }, [systemModal.open]);

  if (!systemModal.open) return null;

  const {
    title,
    message,
    type = "info",
    size = "md",
    image,
    showCloseButton = true,
    primaryAction,
    secondaryAction,
    onClose,
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

  // Size Tailwind classes
  const sizeClasses = {
    sm: "max-w-sm w-full",
    md: "max-w-md w-full",
    lg: "max-w-lg w-full",
    xl: "max-w-xl w-full",
  };

  // Color theme configuration
  const themeConfig = {
    lock: {
      bgColor: "bg-red-50/50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      buttonColor: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
      borderColor: "border-red-100 dark:border-red-900/50",
      IconComponent: Lock,
    },
    danger: {
      bgColor: "bg-red-50/50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      buttonColor: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
      borderColor: "border-red-100 dark:border-red-900/50",
      IconComponent: AlertTriangle,
    },
    warning: {
      bgColor: "bg-amber-50/50 dark:bg-amber-900/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      buttonColor:
        "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
      borderColor: "border-amber-100 dark:border-amber-900/50",
      IconComponent: AlertCircle,
    },
    info: {
      bgColor: "bg-blue-50/50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      buttonColor:
        "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
      borderColor: "border-blue-100 dark:border-blue-900/50",
      IconComponent: Info,
    },
    success: {
      bgColor: "bg-emerald-50/50 dark:bg-emerald-900/15",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      buttonColor:
        "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
      borderColor: "border-emerald-100 dark:border-emerald-900/50",
      IconComponent: CheckCircle2,
    },
  };

  const currentTheme = themeConfig[type] || themeConfig.info;
  const Icon = currentTheme.IconComponent;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 transition-opacity duration-200 ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`${
          sizeClasses[size] || sizeClasses.md
        } bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border ${
          currentTheme.borderColor
        } overflow-hidden transform transition-all duration-200 ${
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
            <div className="mb-5 max-w-[180px] overflow-hidden rounded-lg">
              <img
                src={image}
                alt="modal-illustration"
                className="w-full h-auto object-contain"
              />
            </div>
          )}

          {/* Theme Icon */}
          {!image && Icon && (
            <div
              className={`p-3.5 rounded-full ${currentTheme.iconBg} ${currentTheme.iconColor} mb-4`}
            >
              <Icon className="w-8 h-8" />
            </div>
          )}

          {/* Modal Title */}
          {title && (
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2.5">
              {title}
            </h3>
          )}

          {/* Message */}
          <div className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6 whitespace-pre-line max-w-sm">
            {message}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            {/* Secondary Action */}
            {secondaryAction && (
              <button
                type="button"
                className={`order-2 sm:order-1 px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 w-full sm:w-auto min-w-[120px] cursor-pointer ${
                  secondaryAction.className || ""
                }`}
                onClick={() => {
                  if (secondaryAction.onClick) secondaryAction.onClick();
                  handleClose();
                }}
              >
                {secondaryAction.label}
              </button>
            )}

            {/* Primary Action */}
            <button
              type="button"
              className={`order-1 sm:order-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto min-w-[120px] cursor-pointer ${
                currentTheme.buttonColor
              } ${primaryAction?.className || ""}`}
              onClick={() => {
                if (primaryAction?.onClick) {
                  primaryAction.onClick();
                } else {
                  handleClose();
                }
              }}
            >
              {primaryAction?.label || "Đồng ý"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemModal;
