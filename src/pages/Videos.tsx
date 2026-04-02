import { useEffect, useMemo, useState } from "react";
import { Video as VideoIcon, Download, Share2, Trash2, X, Check, CalendarDays } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Toast from "@/components/Toast";
import FilePreviewModal from "@/components/FilePreviewModal";
import ShareDialog from "@/components/ShareDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getVideoFiles, deleteFile, getDownloadUrl } from "@/services/fileService";
import type { FileItem } from "@/services/fileService";
import { formatFileSize } from "@/utils/fileUtils";

type TimeFilter = "today" | "week" | "month" | "all";

export default function Videos() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" | "warning" | "info" }>({
    open: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchVideoFiles();
  }, []);

  const fetchVideoFiles = async () => {
    setLoading(true);
    try {
      const response = await getVideoFiles();
      if (response.code === 200 && response.data) {
        setFiles(response.data.filter((file) => file.type === "file"));
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("获取视频文件失败:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = useMemo(() => {
    const now = new Date();
    return files.filter((file) => {
      const created = new Date(file.created_at);
      const diffMs = now.getTime() - created.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (timeFilter === "today") return diffDays < 1;
      if (timeFilter === "week") return diffDays <= 7;
      if (timeFilter === "month") return diffDays <= 30;
      return true;
    });
  }, [files, timeFilter]);

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, FileItem[]>();
    filteredFiles.forEach((file) => {
      const d = new Date(file.created_at);
      const key = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
      const existing = groups.get(key) || [];
      existing.push(file);
      groups.set(key, existing);
    });
    return Array.from(groups.entries());
  }, [filteredFiles]);

  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const handleDownload = () => {
    files.filter((f) => selectedFiles.has(f.id)).forEach((file) => {
      window.open(getDownloadUrl(file.id), "_blank");
    });
  };

  const handleShare = () => {
    const firstSelected = files.find((f) => selectedFiles.has(f.id));
    if (!firstSelected) return;
    setSelectedFile(firstSelected);
    setShareDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(Array.from(selectedFiles).map((id) => deleteFile(id)));
      setFiles((prev) => prev.filter((f) => !selectedFiles.has(f.id)));
      setSelectedFiles(new Set());
      setToast({ open: true, message: "文件已移入回收站", type: "success" });
    } catch {
      setToast({ open: true, message: "删除失败", type: "error" });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fafafa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">正在加载视频...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fafafa] text-slate-900">
      <Sidebar activeTab="videos" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar pageTitle="视频" showRefreshButton onRefresh={fetchVideoFiles} />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-400">
            {/* Time Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
              {[
                ["today", "今天"],
                ["week", "最近一周"],
                ["month", "本月"],
                ["all", "全部"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTimeFilter(key as TimeFilter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFilter === key
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-500">
                共 {filteredFiles.length} 个视频
              </span>
            </div>

            {groupedByDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-slate-200 rounded-2xl">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <VideoIcon className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">暂无视频</h3>
                <p className="text-slate-500 text-sm mt-1">您上传的视频会出现在这里</p>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedByDate.map(([date, group]) => (
                  <section key={date}>
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      <h2 className="text-lg font-semibold text-slate-700">{date}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {group.map((file, index) => {
                        const selected = selectedFiles.has(file.id);
                        return (
                          <div
                            key={file.id}
                            className={`group relative bg-white border rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden ${
                              selected ? "ring-2 ring-indigo-600 border-indigo-600" : "border-slate-200"
                            }`}
                            style={{
                              animation: 'fadeIn 0.3s ease-out',
                              animationDelay: `${index * 30}ms`,
                              animationFillMode: 'both'
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFileSelection(file.id);
                              }}
                              className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                selected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white/90 text-slate-600 opacity-0 group-hover:opacity-100 shadow-md"
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </button>

                            <div className="relative aspect-video bg-slate-50 overflow-hidden cursor-pointer" onClick={() => setPreviewFile(file)}>
                              <div className="relative w-full h-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <VideoIcon className="w-16 h-16 text-slate-400" />
                              </div>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>

                            <div className="p-3">
                              <h3
                                className="font-medium text-slate-800 text-sm truncate mb-1.5 group-hover:text-indigo-600 transition-colors"
                                title={file.filename}
                              >
                                {file.filename}
                              </h3>
                              <div className="text-xs text-slate-400">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedFiles.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-2">
            <span className="font-semibold mr-2">{selectedFiles.size} 个已选择</span>
            <button onClick={handleShare} className="p-2 hover:bg-slate-50 rounded-lg transition-colors" title="分享">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={handleDownload} className="p-2 hover:bg-slate-50 rounded-lg transition-colors" title="下载">
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={() => setSelectedFiles(new Set())} className="p-2 hover:bg-slate-50 rounded-lg transition-colors" title="取消选择">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      {shareDialogOpen && selectedFile && (
        <ShareDialog
          fileId={selectedFile.id}
          fileName={selectedFile.filename}
          onClose={() => {
            setShareDialogOpen(false);
            setSelectedFile(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="删除文件"
        description={`确定要删除选中的 ${selectedFiles.size} 个文件吗？文件将被移入回收站，可在30天内恢复。`}
        confirmText="删除"
        cancelText="取消"
        variant="warning"
      />

      <Toast open={toast.open} onClose={() => setToast({ ...toast, open: false })} message={toast.message} type={toast.type} />
    </div>
  );
}
