import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  open: boolean;
  onClose: () => void;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export default function Toast({
  open,
  onClose,
  message,
  type = "info",
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-900",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      textColor: "text-red-900",
    },
    warning: {
      icon: AlertCircle,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      iconColor: "text-amber-600",
      textColor: "text-amber-900",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      textColor: "text-blue-900",
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type];

  return (
    <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div className={`${bgColor} ${borderColor} border-2 rounded-xl shadow-lg p-4 pr-12 max-w-md`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1 ${textColor} hover:bg-black/5 rounded-lg transition-colors`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
