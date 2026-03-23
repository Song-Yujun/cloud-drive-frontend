import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "确定",
  cancelText = "取消",
  variant = "warning",
}: ConfirmDialogProps) {
  if (!open) return null;

  const variantStyles = {
    danger: {
      icon: "bg-red-100",
      iconColor: "text-red-600",
      button: "bg-[#ef4444] hover:bg-red-600",
    },
    warning: {
      icon: "bg-amber-100",
      iconColor: "text-amber-600",
      button: "bg-amber-500 hover:bg-amber-600",
    },
    info: {
      icon: "bg-blue-100",
      iconColor: "text-blue-600",
      button: "bg-[#1121d4] hover:bg-[#0d19a8]",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f6f6f8] rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className={`w-14 h-14 ${styles.icon} rounded-xl flex items-center justify-center mb-6`}>
            <AlertTriangle className={`w-7 h-7 ${styles.iconColor}`} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-[#0f172a] mb-3">
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm text-[#64748b] mb-8 leading-relaxed">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#f6f6f8] rounded-xl transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-3 ${styles.button} text-white font-semibold text-sm rounded-xl shadow-lg transition-all`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
