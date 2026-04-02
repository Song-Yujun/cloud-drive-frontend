import { useState, useEffect } from "react";
import { Trash2, RotateCcw, X, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import { getRecycleBinFiles, restoreFile, permanentDeleteFile, emptyRecycleBin } from "@/services/recycleService";
import type { FileItem } from "@/services/fileService";
import { getFileIcon, formatFileSize, formatDate } from "@/utils/fileUtils";

export default function RecycleBin() {
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
    <div className="flex h-screen bg-[#fafafa] text-slate-900">
      <Sidebar activeTab="trash" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar pageTitle="回收站" showRefreshButton onRefresh={fetchRecycleBinFiles} />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="w-full">
            {/* Info Banner */}
            {files.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">自动清理已开启</h3>
                  <p className="text-sm text-slate-600">
                    文件会在回收站保留 30 天后自动清理且无法恢复。
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-sm font-medium text-slate-500">正在加载...</p>
                </div>
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-slate-200 rounded-2xl">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">回收站为空</h3>
                <p className="text-slate-500 text-sm mt-1">删除的文件会出现在这里</p>
              </div>
            ) : (
              <>
                {/* Action Bar */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    {selectedFiles.size > 0 ? `已选择 ${selectedFiles.size} 项` : `共 ${files.length} 项`}
                  </div>
                  {selectedFiles.size > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBatchRestore}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        恢复
                      </button>
                      <button
                        onClick={handleBatchDelete}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        永久删除
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEmptyRecycleBin}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      清空回收站
                    </button>
                  )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/50 border-b border-slate-200">
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFiles.size === files.length && files.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-0 focus:ring-offset-0"
                      />
                    </div>
                    <div className="col-span-4 text-xs font-medium text-slate-500">文件名</div>
                    <div className="col-span-2 text-xs font-medium text-slate-500">删除时间</div>
                    <div className="col-span-2 text-xs font-medium text-slate-500">原路径</div>
                    <div className="col-span-1 text-xs font-medium text-slate-500 text-right">大小</div>
                    <div className="col-span-2 text-xs font-medium text-slate-500 text-right">操作</div>
                  </div>

                  {/* File Items */}
                  {files.map((file, index) => (
                    <div
                      key={file.id}
                      className={`grid grid-cols-12 gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0 ${
                        selectedFiles.has(file.id) ? 'bg-indigo-50/30' : ''
                      }`}
                      style={{
                        animation: 'fadeIn 0.3s ease-out',
                        animationDelay: `${index * 30}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => toggleSelectFile(file.id)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-0 focus:ring-offset-0"
                        />
                      </div>
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-50">
                          {getFileIcon(file.type, file.mime_type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-900 truncate text-sm">
                            {file.filename}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {file.type === 'folder' ? '文件夹' : file.mime_type}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center text-sm text-slate-600">
                        {file.deleted_at ? formatDate(file.deleted_at) : '—'}
                      </div>
                      <div className="col-span-2 flex items-center text-sm text-slate-600">
                        我的文件
                      </div>
                      <div className="col-span-1 flex items-center justify-end text-sm text-slate-700">
                        {file.type === 'folder' ? '—' : formatFileSize(file.size)}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(file.id, file.filename)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                          title="恢复"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          恢复
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(file.id, file.filename)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                          title="删除"
                        >
                          <X className="h-3.5 w-3.5" />
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="danger"
      />

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
