import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, RotateCcw, X, AlertTriangle, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import { getRecycleBinFiles, restoreFile, permanentDeleteFile, emptyRecycleBin } from "@/services/recycleService";
import type { FileItem } from "@/services/fileService";
import { getFileIcon, formatFileSize, formatDate } from "@/utils/fileUtils";

export default function RecycleBin() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" | "warning" | "info" }>({ open: false, message: "", type: "info" });

  useEffect(() => {
    fetchRecycleBinFiles();
  }, []);

  const fetchRecycleBinFiles = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await getRecycleBinFiles();
      if (response.code === 200) {
        setFiles(response.data || []);
      } else {
        setError(response.msg || "获取回收站文件失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message || "获取回收站文件失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (fileId: number, fileName: string) => {
    setConfirmDialog({
      open: true,
      title: "恢复文件",
      description: `确定要恢复 "${fileName}" 吗？`,
      onConfirm: async () => {
        try {
          const response = await restoreFile(fileId);
          if (response.code === 200) {
            setFiles(files.filter(f => f.id !== fileId));
            setToast({ open: true, message: "恢复成功！", type: "success" });
          } else {
            setToast({ open: true, message: response.msg || "恢复失败", type: "error" });
          }
        } catch (err: any) {
          setToast({ open: true, message: err.response?.data?.msg || err.message || "恢复失败", type: "error" });
        }
      }
    });
  };

  const handlePermanentDelete = (fileId: number, fileName: string) => {
    setConfirmDialog({
      open: true,
      title: "永久删除文件",
      description: `确定要永久删除 "${fileName}" 吗？此操作无法撤销！`,
      onConfirm: async () => {
        try {
          const response = await permanentDeleteFile(fileId);
          if (response.code === 200) {
            setFiles(files.filter(f => f.id !== fileId));
            setToast({ open: true, message: "已永久删除", type: "success" });
          } else {
            setToast({ open: true, message: response.msg || "删除失败", type: "error" });
          }
        } catch (err: any) {
          setToast({ open: true, message: err.response?.data?.msg || err.message || "删除失败", type: "error" });
        }
      }
    });
  };

  const handleEmptyRecycleBin = () => {
    if (files.length === 0) {
      setToast({ open: true, message: "回收站已经是空的", type: "info" });
      return;
    }

    setConfirmDialog({
      open: true,
      title: "清空回收站",
      description: `确定要清空回收站吗？这将永久删除 ${files.length} 个文件/文件夹，此操作无法撤销！`,
      onConfirm: async () => {
        try {
          const response = await emptyRecycleBin();
          if (response.code === 200) {
            setFiles([]);
            setToast({ open: true, message: "回收站已清空", type: "success" });
          } else {
            setToast({ open: true, message: response.msg || "清空失败", type: "error" });
          }
        } catch (err: any) {
          setToast({ open: true, message: err.response?.data?.msg || err.message || "清空失败", type: "error" });
        }
      }
    });
  };

  const toggleSelectFile = (fileId: number) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  const handleBatchRestore = () => {
    if (selectedFiles.size === 0) {
      setToast({ open: true, message: "请先选择要恢复的文件", type: "warning" });
      return;
    }

    setConfirmDialog({
      open: true,
      title: "批量恢复",
      description: `确定要恢复选中的 ${selectedFiles.size} 个文件吗？`,
      onConfirm: async () => {

    let successCount = 0;
    let failCount = 0;

    for (const fileId of selectedFiles) {
      try {
        const response = await restoreFile(fileId);
        if (response.code === 200) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

        setToast({ open: true, message: `恢复完成！成功: ${successCount} 个，失败: ${failCount} 个`, type: successCount > 0 ? "success" : "error" });
        setSelectedFiles(new Set());
        fetchRecycleBinFiles();
      }
    });
  };

  const handleBatchDelete = () => {
    if (selectedFiles.size === 0) {
      setToast({ open: true, message: "请先选择要删除的文件", type: "warning" });
      return;
    }

    setConfirmDialog({
      open: true,
      title: "批量永久删除",
      description: `确定要永久删除选中的 ${selectedFiles.size} 个文件吗？此操作无法撤销！`,
      onConfirm: async () => {

    let successCount = 0;
    let failCount = 0;

    for (const fileId of selectedFiles) {
      try {
        const response = await permanentDeleteFile(fileId);
        if (response.code === 200) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

        setToast({ open: true, message: `删除完成！成功: ${successCount} 个，失败: ${failCount} 个`, type: successCount > 0 ? "success" : "error" });
        setSelectedFiles(new Set());
        fetchRecycleBinFiles();
      }
    });
  };

  return (
    <div className="flex h-screen bg-[#f6f6f8]">
      {/* Sidebar */}
      <Sidebar activeTab="trash" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          pageTitle="回收站"
          showBackButton
          customActions={
            <>
              {selectedFiles.size > 0 && (
                <>
                  <button
                    onClick={handleBatchRestore}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#1121d4] hover:bg-[#1121d4]/10 rounded-lg transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                    恢复所选
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#ef4444] hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X className="h-4 w-4" />
                    永久删除
                  </button>
                </>
              )}
              {files.length > 0 && (
                <button
                  onClick={handleEmptyRecycleBin}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#ef4444] hover:bg-red-600 text-white font-semibold text-sm rounded-xl shadow-[0px_10px_15px_-3px_rgba(239,68,68,0.3)] transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  清空回收站
                </button>
              )}
            </>
          }
        />

        {/* Content Area - Editorial Spacing */}
        <main className="flex-1 overflow-auto p-8">
          {/* Info Banner - Indigo Vault Style */}
          {files.length > 0 && (
            <div className="mb-8 p-5 bg-amber-50 rounded-xl flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#0f172a] mb-1">自动清理已开启</h3>
                <p className="text-sm text-[#64748b]">
                  文件会在回收站保留 30 天后自动永久删除且无法恢复。
                </p>
              </div>
            </div>
          )}

        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

          {loading ? (
            <div className="text-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-[#1121d4] mx-auto mb-4" />
              <p className="text-sm font-semibold text-[#64748b]">加载中...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center">
              <div className="w-20 h-20 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-[#94a3b8]" />
              </div>
              <h3 className="text-headline text-[#0f172a] mb-2">回收站为空</h3>
              <p className="text-sm text-[#64748b] mb-8">删除的文件会出现在这里</p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 bg-[#1121d4] hover:bg-[#0d19a8] text-white font-semibold text-sm rounded-xl shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.2)] transition-all"
              >
                返回文件列表
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Table Header - No border, background shift */}
              <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-[#fafafa]">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === files.length && files.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-[#1121d4] border-[#e2e8f0] rounded focus:ring-[#1121d4]/20"
                  />
                </div>
                <div className="col-span-4 text-xs font-bold uppercase tracking-wider text-[#64748b]">文件名</div>
                <div className="col-span-2 text-xs font-bold uppercase tracking-wider text-[#64748b]">删除时间</div>
                <div className="col-span-2 text-xs font-bold uppercase tracking-wider text-[#64748b]">原路径 / 类型 / 标签</div>
                <div className="col-span-2 text-xs font-bold uppercase tracking-wider text-[#64748b] text-right">大小</div>
                <div className="col-span-1 text-xs font-bold uppercase tracking-wider text-[#64748b] text-right">操作</div>
              </div>

              {/* File Items - 64px min height */}
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`grid grid-cols-12 gap-4 px-8 py-5 min-h-[64px] hover:bg-[#fafafa] transition-colors ${
                    selectedFiles.has(file.id) ? 'bg-[#1121d4]/5' : ''
                  }`}
                >
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleSelectFile(file.id)}
                      className="w-4 h-4 text-[#1121d4] border-[#e2e8f0] rounded focus:ring-[#1121d4]/20"
                    />
                  </div>
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 opacity-60">
                      {getFileIcon(file.type, file.mime_type)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#0f172a] truncate text-sm">
                        {file.filename}
                      </div>
                      <div className="text-xs text-[#64748b] mt-0.5">
                        {file.type === 'folder' ? '文件夹' : file.mime_type}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-[#64748b]">
                    {file.deleted_at ? formatDate(file.deleted_at) : '—'}
                  </div>
                  <div className="col-span-2 flex items-center text-xs text-[#64748b]">
                    我的文件 / {file.type === 'folder' ? '文件夹' : '文档'} / 标签
                  </div>
                  <div className="col-span-2 flex items-center justify-end text-sm font-medium text-[#0f172a]">
                    {file.type === 'folder' ? '—' : formatFileSize(file.size)}
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleRestore(file.id, file.filename)}
                      className="p-2 text-[#1121d4] hover:bg-[#1121d4]/10 rounded-lg transition-all"
                      title="恢复"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(file.id, file.filename)}
                      className="p-2 text-[#ef4444] hover:bg-red-50 rounded-lg transition-all"
                      title="永久删除"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="danger"
      />

      {/* Toast Notification */}
      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
