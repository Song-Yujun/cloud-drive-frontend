import { useEffect, useState } from "react";
import { Clock, Plus, Video } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Toast from "@/components/Toast";
import SmartUploadDialog from "@/components/SmartUploadDialog";
import FilePreviewModal from "@/components/FilePreviewModal";
import { getRecentFiles, getThumbnailUrl } from "@/services/fileService";
import type { FileItem } from "@/services/fileService";
import { getFileIcon, formatFileSize, formatDate } from "@/utils/fileUtils";

type TimeFilter = "today" | "week" | "month" | "all";

export default function Recent() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" | "warning" | "info" }>({
    open: false, message: "", type: "info"
  });
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  useEffect(() => { fetchRecent(); }, []);

  useEffect(() => {
    filterFilesByTime();
  }, [files, timeFilter]);

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const response = await getRecentFiles();
      if (response.code === 200 && response.data) {
        setFiles(response.data.filter((file) => file.type === "file"));
      } else {
        setFiles([]);
      }
    } catch (error) {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFilesByTime = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    let filtered = files;

    if (timeFilter === "today") {
      filtered = files.filter(file => new Date(file.updated_at) >= today);
    } else if (timeFilter === "week") {
      filtered = files.filter(file => new Date(file.updated_at) >= weekAgo);
    } else if (timeFilter === "month") {
      filtered = files.filter(file => new Date(file.updated_at) >= monthAgo);
    }

    setFilteredFiles(filtered);
  };

  const isPreviewable = (file: FileItem) => file.mime_type.startsWith("image/") || file.mime_type.startsWith("video/");
  const isVideo = (file: FileItem) => file.mime_type.startsWith("video/");

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file);
  };

  const getFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case "today": return "今天";
      case "week": return "最近一周";
      case "month": return "本月";
      case "all": return "全部";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fafafa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">正在为您准备文件...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fafafa] text-slate-900">
      <Sidebar activeTab="recent" onTabChange={() => {}} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar pageTitle="最近使用" showRefreshButton onRefresh={fetchRecent} />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-[1600px]">
            {/* Time Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
              {(["today", "week", "month", "all"] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFilter === filter
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {getFilterLabel(filter)}
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-500">
                共 {filteredFiles.length} 个文件
              </span>
            </div>

            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-slate-200 rounded-2xl">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {timeFilter === "all" ? "暂无最近文件" : `${getFilterLabel(timeFilter)}暂无文件`}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  {timeFilter === "all" ? "您最近访问的文件会出现在这里" : "尝试切换其他时间范围"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="group relative bg-white border border-slate-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden cursor-pointer"
                    style={{
                      animation: 'fadeIn 0.3s ease-out',
                      animationDelay: `${index * 30}ms`,
                      animationFillMode: 'both'
                    }}
                    onClick={() => handlePreview(file)}
                  >
                    <div className="relative aspect-square bg-slate-50 overflow-hidden">
                      {isPreviewable(file) ? (
                        <>
                          {isVideo(file) ? (
                            <div className="relative w-full h-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <Video className="w-16 h-16 text-slate-400" />
                              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                                视频
                              </div>
                            </div>
                          ) : (
                            <img
                              src={getThumbnailUrl(file.id)}
                              alt={file.filename}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-14 h-14 text-slate-300 group-hover:text-indigo-500 transition-colors duration-300">
                            {getFileIcon(file.type, file.mime_type)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3
                        className="font-medium text-slate-800 text-sm truncate mb-1.5 group-hover:text-indigo-600 transition-colors"
                        title={file.filename}
                      >
                        {file.filename}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <button
        onClick={() => setShowUploadDialog(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 z-50"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium text-sm">上传文件</span>
      </button>

      <SmartUploadDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSuccess={() => {
          setShowUploadDialog(false);
          fetchRecent();
          setToast({ open: true, message: "文件已成功安全上传", type: "success" });
        }}
      />

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        type={toast.type}
      />

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
