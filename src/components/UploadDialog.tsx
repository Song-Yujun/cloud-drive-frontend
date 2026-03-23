import { useState, useRef } from "react";
import { X, Upload, File, Trash2, CheckCircle } from "lucide-react";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

export default function UploadDialog({
  open,
  onClose,
  onUpload,
}: UploadDialogProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending",
    }));

    setUploadFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUploadAll = async () => {
    const filesToUpload = uploadFiles.filter((f) => f.status === "pending");
    if (filesToUpload.length === 0) return;

    // 模拟上传进度
    for (const uploadFile of filesToUpload) {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading" } : f
        )
      );

      // 模拟进度更新
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, progress } : f
          )
        );
      }

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "success", progress: 100 } : f
        )
      );
    }

    // 调用实际上传函数
    try {
      await onUpload(filesToUpload.map((f) => f.file));
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const pendingCount = uploadFiles.filter((f) => f.status === "pending").length;
  const uploadingCount = uploadFiles.filter((f) => f.status === "uploading").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#e2e8f0]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">上传中心</h2>
              <p className="text-sm text-[#64748b] mt-1">
                我的文件 → 上传文件
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f6f6f8] rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {uploadFiles.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging
                  ? "border-[#1121d4] bg-[#1121d4]/5"
                  : "border-[#e2e8f0] hover:border-[#1121d4]/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="w-16 h-16 bg-[#1121d4]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-[#1121d4]" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">
                拖放文件到此处
              </h3>
              <p className="text-sm text-[#64748b] mb-6">
                或者，您也可以点击下方按钮选择文件
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-[#1121d4] hover:bg-[#0d19a8] text-white font-semibold text-sm rounded-xl shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.2)] transition-all"
              >
                <Upload className="w-4 h-4 inline-block mr-2" />
                选择文件
              </button>
              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#64748b]">
                <div className="flex items-center gap-1">
                  <File className="w-4 h-4" />
                  支持 PDF, Word, PPT
                </div>
                <div className="flex items-center gap-1">
                  <File className="w-4 h-4" />
                  PNG, JPG, SVG
                </div>
                <div className="flex items-center gap-1">
                  <File className="w-4 h-4" />
                  最大 500MB
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Upload List Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0f172a]">
                  上传列表 ({uploadFiles.length})
                </h3>
                {pendingCount > 0 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-semibold text-[#1121d4] hover:text-[#0d19a8]"
                  >
                    + 添加更多
                  </button>
                )}
              </div>

              {/* File List */}
              {uploadFiles.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="p-4 bg-[#fafafa] rounded-lg hover:bg-[#f6f6f8] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      uploadFile.status === "success" ? "bg-emerald-100" : "bg-blue-100"
                    }`}>
                      {uploadFile.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <File className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0f172a] truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-[#64748b]">
                        {formatFileSize(uploadFile.file.size)} • {uploadFile.progress}% 完成
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(uploadFile.id)}
                      disabled={uploadFile.status === "uploading"}
                      className="p-2 text-[#64748b] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Progress Bar */}
                  {uploadFile.status !== "pending" && (
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          uploadFile.status === "success"
                            ? "bg-emerald-500"
                            : uploadFile.status === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {uploadFiles.length > 0 && (
          <div className="p-6 border-t border-[#e2e8f0] bg-[#fafafa]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#64748b]">
                {uploadingCount > 0 ? (
                  <span className="font-semibold text-blue-600">
                    正在上传 {uploadingCount} 个文件...
                  </span>
                ) : pendingCount > 0 ? (
                  <span>准备上传 {pendingCount} 个文件</span>
                ) : (
                  <span className="font-semibold text-emerald-600">
                    全部上传完成！
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {pendingCount === 0 && uploadingCount === 0 ? (
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#1121d4] hover:bg-[#0d19a8] text-white font-semibold text-sm rounded-xl shadow-lg transition-all"
                  >
                    完成
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setUploadFiles([])}
                      className="px-6 py-2.5 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-white rounded-xl transition-all"
                    >
                      暂停所有
                    </button>
                    <button
                      onClick={handleUploadAll}
                      disabled={pendingCount === 0}
                      className={`px-6 py-2.5 text-white font-semibold text-sm rounded-xl shadow-lg transition-all ${
                        pendingCount > 0
                          ? 'bg-[#1121d4] hover:bg-[#0d19a8]'
                          : 'bg-[#94a3b8] cursor-not-allowed'
                      }`}
                    >
                      开始上传
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>
    </div>
  );
}
