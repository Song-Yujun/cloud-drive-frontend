import { useState, useEffect } from "react";
import { X, FileText, Info } from "lucide-react";

interface RenameDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string;
  fileIcon?: React.ReactNode;
}

export default function RenameDialog({
  open,
  onClose,
  onConfirm,
  currentName,
  fileIcon,
}: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    if (open) {
      setNewName(currentName);
    }
  }, [open, currentName]);

  if (!open) return null;

  const handleConfirm = () => {
    if (newName.trim() && newName !== currentName) {
      onConfirm(newName.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

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
          className="absolute top-4 right-4 p-2 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f6f6f8] rounded-lg transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#0f172a] mb-1">
                重命名文件
              </h2>
              <p className="text-sm text-[#64748b]">
                RENAME FILE
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">
              文件名
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {fileIcon || <FileText className="w-5 h-5 text-[#64748b]" />}
              </div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
                className="w-full pl-14 pr-4 py-3 bg-[#f6f6f8] border-0 rounded-lg text-sm font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1121d4]/20 transition-all"
              />
            </div>
          </div>

          {/* Info */}
          <div className="mb-8 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
              如改文件名称后同名文件会覆盖文件,在任何所用程序中打开。
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#f6f6f8] rounded-xl transition-all"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!newName.trim() || newName === currentName}
              className={`flex-1 px-6 py-3 text-white font-semibold text-sm rounded-xl shadow-lg transition-all ${
                newName.trim() && newName !== currentName
                  ? 'bg-[#1121d4] hover:bg-[#0d19a8] shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.2)]'
                  : 'bg-[#94a3b8] cursor-not-allowed'
              }`}
            >
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
