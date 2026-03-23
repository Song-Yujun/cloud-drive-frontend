import { useEffect, useState } from "react";
import { Clock, FileText, Image, Video, File, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Toast from "@/components/Toast";
import { getFiles } from "@/services/fileService";
import type { FileItem } from "@/services/fileService";
import { getFileIcon, formatFileSize, formatDate } from "@/utils/fileUtils";

export default function Recent() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" | "warning" | "info" }>({ 
    open: false, message: "", type: "info" 
  });
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const fetchRecentFiles = async () => {
    setLoading(true);
    try {
      const response = await getFiles({
        page: 1,
        pageSize: 50,
      });
      
      if (response.code === 200 && response.data) {
        const sortedFiles = response.data
          .filter(file => file.type === 'file')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 30);
        setFiles(sortedFiles);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("获取最近文件失败:", error);
      setFiles([]);
    } finally {
      setLoading(false);
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
      <Sidebar activeTab="recent" onUploadFile={() => setShowUploadDialog(true)} onCreateFolder={() => {}} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          pageTitle="最近使用"
          showBackButton
        />

        <main className="flex-1 overflow-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-2">最近使用</h2>
            <p className="text-sm text-[#64748b]">
              查看您最近访问过的文件，快速找到您需要的内容。
            </p>
          </div>

          {/* File Grid */}
          {files.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center">
              <div className="w-20 h-20 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-[#94a3b8]" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2">暂无最近文件</h3>
              <p className="text-sm text-[#64748b]">您最近访问的文件会出现在这里</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* File Preview */}
                  <div className="aspect-square bg-[#fafafa] flex items-center justify-center">
                    <div className="w-16 h-16">
                      {getFileIcon(file.type, file.mime_type)}
                    </div>
                  </div>
                  
                  {/* File Info */}
                  <div className="p-4">
                    <div className="font-semibold text-[#0f172a] truncate text-sm mb-1">
                      {file.filename}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#64748b]">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate(file.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setShowUploadDialog(true)}
          className="w-14 h-14 bg-[#1121d4] hover:bg-[#0d19a8] text-white rounded-full shadow-[0px_10px_15px_-3px_rgba(17,33,212,0.3)] transition-all hover:shadow-[0px_10px_20px_-3px_rgba(17,33,212,0.4)] flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

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
