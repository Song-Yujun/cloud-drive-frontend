import { useState } from "react";
import { X, Folder } from "lucide-react";

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (folderName: string) => void;
  currentPath?: string;
}

export default function CreateFolderDialog({
  open,
  onClose,
  onConfirm,
  currentPath = "在当前目录中",
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    if (folderName.trim()) {
      onConfirm(folderName.trim());
      setFolderName("");
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
            <div className="w-12 h-12 bg-[#1121d4]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Folder className="w-6 h-6 text-[#1121d4]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#0f172a] mb-1">
                新建文件夹
              </h2>
              <p className="text-sm text-[#64748b]">
                {currentPath}，创建一个新文件夹
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">
              文件夹名称
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="未命名文件夹"
              autoFocus
              className="w-full px-4 py-3 bg-[#f6f6f8] border-0 rounded-lg text-sm font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1121d4]/20 transition-all"
            />
          </div>

          {/* Preview */}
          <div className="mb-8 p-4 bg-[#f6f6f8] rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1121d4] rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-0.5">
                预览路径
              </p>
              <p className="text-sm font-medium text-[#0f172a] truncate">
                /我的文件夹/{folderName || "未命名文件夹"}
              </p>
            </div>
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
              disabled={!folderName.trim()}
              className={`flex-1 px-6 py-3 text-white font-semibold text-sm rounded-xl shadow-lg transition-all ${
                folderName.trim()
                  ? 'bg-[#1121d4] hover:bg-[#0d19a8] shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.2)]'
                  : 'bg-[#94a3b8] cursor-not-allowed'
              }`}
            >
              创建
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
