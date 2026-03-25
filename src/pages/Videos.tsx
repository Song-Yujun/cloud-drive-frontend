import { useEffect, useMemo, useState } from "react";
import { Video as VideoIcon, Download, Share2, Trash2, X, Check, CalendarDays, Play } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Toast from "@/components/Toast";
import FilePreviewModal from "@/components/FilePreviewModal";
import ShareDialog from "@/components/ShareDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getVideoFiles, deleteFile, getDownloadUrl, getThumbnailUrl } from "@/services/fileService";
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
      <div className="flex items-center justify-center h-screen bg-[#f6f6f8]">
        <div className="text-lg font-semibold text-[#64748b]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f6f6f8]">
      <Sidebar activeTab="videos" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar pageTitle="视频" showUserInfo showRefreshButton onRefresh={fetchVideoFiles} />

        <main className="flex-1 overflow-auto p-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#0f172a] mb-2">视频</h1>
              <p className="text-[#64748b]">{filteredFiles.length} 条视频</p>
            </div>
            <div className="bg-[#eef2ff] rounded-xl p-1 flex items-center gap-1">
              {[
                ["today", "今天"],
                ["week", "最近一周"],
                ["month", "本月"],
                ["all", "全部"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTimeFilter(key as TimeFilter)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    timeFilter === key ? "bg-white text-[#1121d4] shadow-sm" : "text-[#475569] hover:bg-white/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {groupedByDate.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center">
              <div className="w-20 h-20 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-6">
                <VideoIcon className="w-10 h-10 text-[#94a3b8]" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2">暂无视频</h3>
              <p className="text-sm text-[#64748b]">你上传的视频会出现在这里</p>
            </div>
          ) : (
            <div className="space-y-10">
              {groupedByDate.map(([date, group]) => (
                <section key={date}>
                  <div className="flex items-center gap-2 mb-4 text-[#334155]">
                    <CalendarDays className="w-4 h-4" />
                    <h2 className="text-2xl font-bold">{date}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {group.map((file) => {
                      const selected = selectedFiles.has(file.id);
                      return (
                        <div key={file.id} className={`relative rounded-2xl overflow-hidden group bg-white ${selected ? "ring-2 ring-[#1d4ed8]" : ""}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFileSelection(file.id);
                            }}
                            className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center ${
                              selected ? "bg-[#1d4ed8] text-white" : "bg-white/90 text-[#334155] opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <div className="relative aspect-video cursor-pointer" onClick={() => setPreviewFile(file)}>
                            <img
                              src={getThumbnailUrl(file.id)}
                              alt={file.filename}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow">
                                <Play className="w-6 h-6 text-[#1121d4] ml-0.5" />
                              </div>
                            </div>
                          </div>

                          <div className="px-3 py-2.5 border-t border-[#f1f5f9]">
                            <div className="text-sm font-semibold text-[#0f172a] truncate">{file.filename}</div>
                            <div className="text-xs text-[#64748b] mt-0.5">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedFiles.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white border border-[#e2e8f0] text-[#0f172a] rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-2">
            <span className="font-semibold mr-2">{selectedFiles.size} 个已选择</span>
            <button onClick={handleShare} className="p-2 hover:bg-[#f8fafc] rounded-lg"><Share2 className="w-5 h-5" /></button>
            <button onClick={handleDownload} className="p-2 hover:bg-[#f8fafc] rounded-lg"><Download className="w-5 h-5" /></button>
            <button onClick={() => setDeleteDialogOpen(true)} className="p-2 hover:bg-[#fef2f2] text-[#ef4444] rounded-lg"><Trash2 className="w-5 h-5" /></button>
            <button onClick={() => setSelectedFiles(new Set())} className="p-2 hover:bg-[#f8fafc] rounded-lg"><X className="w-5 h-5" /></button>
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
