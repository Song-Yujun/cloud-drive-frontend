import { useEffect, useState } from "react";
import { Image as ImageIcon, Download, Share2, Trash2, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Toast from "@/components/Toast";
import FilePreviewModal from "@/components/FilePreviewModal";
import ShareDialog from "@/components/ShareDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getFiles, deleteFile } from "@/services/fileService";
import type { FileItem } from "@/services/fileService";
import { formatFileSize } from "@/utils/fileUtils";

export default function Images() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" | "warning" | "info" }>({
    open: false, message: "", type: "info"
  });

  useEffect(() => {
    fetchImageFiles();
  }, []);

  const fetchImageFiles = async () => {
    setLoading(true);
    try {
      const response = await getFiles({
        page: 1,
        pageSize: 100,
      });

      if (response.code === 200 && response.data) {
        // 只显示图片文件
        const imageFiles = response.data.filter(file =>
          file.type === 'file' && file.mime_type.startsWith('image/')
        );
        setFiles(imageFiles);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("获取图片文件失败:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleDownload = () => {
    const selectedFilesList = files.filter(f => selectedFiles.has(f.id));
    selectedFilesList.forEach(file => {
      window.open(file.url, '_blank');
    });
  };

  const handleShare = () => {
    const firstSelected = files.find(f => selectedFiles.has(f.id));
    if (firstSelected) {
      setSelectedFile(firstSelected);
      setShareDialogOpen(true);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const deletePromises = Array.from(selectedFiles).map(id => deleteFile(id));
      await Promise.all(deletePromises);

      setFiles(files.filter(f => !selectedFiles.has(f.id)));
      setSelectedFiles(new Set());
      setToast({ open: true, message: "文件已移入回收站", type: "success" });
    } catch (error) {
      setToast({ open: true, message: "删除失败", type: "error" });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const getImageUrl = (file: FileItem) => {
    const token = localStorage.getItem('token');
    return `/api/preview/${file.id}?token=${token}`;
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
      <Sidebar activeTab="images" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar showUserInfo />

        <main className="flex-1 overflow-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2">媒体库</h1>
            <p className="text-sm text-[#64748b]">查看和管理您的数字资产</p>
          </div>
          {/* Filter Tabs */}
          <div className="flex items-center gap-4 mb-6">
            <button className="px-6 py-2.5 bg-[#1121d4] text-white font-semibold rounded-lg text-sm">
              所有
            </button>
            <button className="px-6 py-2.5 bg-white text-[#64748b] font-semibold rounded-lg text-sm hover:bg-[#fafafa] transition-colors">
              图片
            </button>
            <button className="px-6 py-2.5 bg-white text-[#64748b] font-semibold rounded-lg text-sm hover:bg-[#fafafa] transition-colors">
              视频
            </button>
          </div>

          {files.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center">
              <div className="w-20 h-20 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-[#94a3b8]" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2">暂无图片</h3>
              <p className="text-sm text-[#64748b]">你上传的图片会出现在这里</p>
            </div>
          ) : (
            <>
              {/* Grid View for Images */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {files.map((file) => {
                  const isSelected = selectedFiles.has(file.id);
                  return (
                    <div
                      key={file.id}
                      className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                    >
                      {/* Checkbox */}
                      <div className="absolute top-3 left-3 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFileSelection(file.id);
                          }}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#1121d4] border-[#1121d4]'
                              : 'bg-white/90 border-white/90 opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Image Preview */}
                      <div
                        className="aspect-square bg-[#fafafa] flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => setPreviewFile(file)}
                      >
                        <img
                          src={getImageUrl(file)}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* File Info */}
                      <div className="p-3">
                        <div className="font-semibold text-[#0f172a] truncate text-sm mb-1">
                          {file.filename}
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#64748b]">
                          <span>{formatFileSize(file.size)}</span>
                          <span className="uppercase">{file.mime_type.split('/')[1]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              <div className="mt-8 text-center">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#64748b] font-semibold rounded-lg text-sm hover:bg-[#fafafa] transition-colors shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  上传更多
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Bottom Action Bar */}
      {selectedFiles.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-[#2a2d4a] text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6">
            {/* Selected Count */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1121d4] rounded-full flex items-center justify-center font-bold">
                {selectedFiles.size}
              </div>
              <span className="font-semibold">已选择 {selectedFiles.size} 个项目</span>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/20" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
                title="下载"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
                title="分享"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/20" />

            {/* Close Button */}
            <button
              onClick={() => setSelectedFiles(new Set())}
              className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              title="取消选择"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Share Dialog */}
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

      {/* Delete Confirmation Dialog */}
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
