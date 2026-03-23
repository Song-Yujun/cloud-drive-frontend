import { useEffect, useState } from "react";
import { Grid3x3, List, SlidersHorizontal, Share2, Trash2, Upload, Edit3 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ShareDialog from "@/components/ShareDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import CreateFolderDialog from "@/components/CreateFolderDialog";
import RenameDialog from "@/components/RenameDialog";
import SmartUploadDialog from "@/components/SmartUploadDialog";
import FilePreviewModal from "@/components/FilePreviewModal";
import { getFiles, deleteFile, createFolder, renameFile } from "@/services/fileService";
import type { FileItem } from "@/services/fileService";
import { getFileIcon, formatFileSize, formatDate } from "@/utils/fileUtils";

export default function Dashboard() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" | "warning" | "info" }>({ open: false, message: "", type: "info" });
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const [smartUploadOpen, setSmartUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [folderPath, setFolderPath] = useState<Array<{ id: number | null; name: string }>>([
    { id: null, name: '全部文件' }
  ]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await getFiles({
        page: 1,
        pageSize: 50,
        keyword: searchKeyword,
        parentId: currentFolderId
      });
      console.log("后端返回的文件列表:", response);
      
      if (response.code === 200 && response.data) {
        setFiles(response.data);
      } else {
        console.error("获取文件失败:", response.msg);
        setFiles([]);
      }
    } catch (error) {
      console.error("获取文件失败:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentFolderId]);

  const handleShareFile = (file: FileItem) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
    setSelectedFile(null);
  };

  const handleDeleteFile = (file: FileItem) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      const response = await deleteFile(fileToDelete.id);
      // 后端返回 {"id":2,"message":"删除成功"} 或 {"code":200,...}
      if ((response as any).id || response.code === 200) {
        setFiles(files.filter(f => f.id !== fileToDelete.id));
        setToast({ open: true, message: "文件已移入回收站", type: "success" });
      } else {
        setToast({ open: true, message: response.msg || "删除失败", type: "error" });
      }
    } catch (err: any) {
      setToast({ open: true, message: err.response?.data?.msg || err.message || "删除失败", type: "error" });
    } finally {
      setFileToDelete(null);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      const response = await createFolder(folderName, currentFolderId || undefined);
      if (response.data) {
        setToast({ open: true, message: "文件夹创建成功", type: "success" });
        setCreateFolderOpen(false);
        fetchFiles();
      } else {
        setToast({ open: true, message: "文件夹创建失败", type: "error" });
      }
    } catch (error: any) {
      console.error("创建文件夹失败:", error);
      setToast({ open: true, message: error.response?.data?.error || "创建文件夹失败", type: "error" });
    }
  };

  const handleRenameFile = (file: FileItem) => {
    setFileToRename(file);
    setRenameDialogOpen(true);
  };

  const confirmRename = async (newName: string) => {
    if (!fileToRename) return;

    try {
      const response = await renameFile(fileToRename.id, newName);
      if (response.message) {
        setFiles(files.map(f => 
          f.id === fileToRename.id ? { ...f, filename: response.new_name } : f
        ));
        setToast({ open: true, message: response.message, type: "success" });
      } else {
        setToast({ open: true, message: "重命名失败", type: "error" });
      }
    } catch (err: any) {
      setToast({ open: true, message: err.response?.data?.error || err.message || "重命名失败", type: "error" });
    } finally {
      setFileToRename(null);
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
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onUploadFile={() => setSmartUploadOpen(true)}
        onCreateFolder={() => setCreateFolderOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          showSearch
          searchValue={searchKeyword}
          onSearchChange={setSearchKeyword}
          onSearchSubmit={fetchFiles}
          showMySharesButton
          showUserInfo
        />

        {/* Content Area - Editorial Spacing (p-8) */}
        <main className="flex-1 overflow-auto p-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-6">
            {folderPath.map((folder, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentFolderId(folder.id);
                    setFolderPath(folderPath.slice(0, index + 1));
                  }}
                  className={`text-sm font-semibold transition-colors ${
                    index === folderPath.length - 1
                      ? 'text-[#1121d4]'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  {folder.name}
                </button>
                {index < folderPath.length - 1 && (
                  <span className="text-[#64748b]">/</span>
                )}
              </div>
            ))}
          </div>

          {/* Tabs and View Controls - No borders, background shifts */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-8">
              <button className="text-sm font-bold text-[#1121d4] pb-3 border-b-2 border-[#1121d4]">
                我的文件
              </button>
              <button className="text-sm font-semibold text-[#64748b] hover:text-[#0f172a] pb-3 transition-colors">
                共享文件
              </button>
              <button className="text-sm font-semibold text-[#64748b] hover:text-[#0f172a] pb-3 transition-colors">
                工作
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "grid" 
                    ? "bg-[#1121d4]/10 text-[#1121d4]" 
                    : "text-[#64748b] hover:bg-[#f6f6f8]"
                }`}
                title="网格视图"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "list" 
                    ? "bg-[#1121d4]/10 text-[#1121d4]" 
                    : "text-[#64748b] hover:bg-[#f6f6f8]"
                }`}
                title="列表视图"
              >
                <List className="h-4 w-4" />
              </button>
              <button 
                className="p-2.5 rounded-lg text-[#64748b] hover:bg-[#f6f6f8] transition-all"
                title="详细信息"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Drag and Drop Upload Area */}
          <div 
            onClick={() => setSmartUploadOpen(true)}
            className="mb-6 bg-white rounded-xl p-16 border-2 border-dashed border-[#e2e8f0] hover:border-[#1121d4] transition-colors cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#1121d4]/10 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="h-8 w-8 text-[#1121d4]" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2">拖拽文件到这里上传</h3>
              <p className="text-sm text-[#64748b] mb-6">
                支持拖拽上传，单个文件最大支持 10GB
              </p>
              <div className="text-sm font-semibold text-[#1121d4] hover:text-[#0d19a8] transition-colors">
                或点击选择文件上传
              </div>
            </div>
          </div>

          {/* File List - Floating card with no internal borders */}
          {files.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm">
              {viewMode === "list" ? (
                <>
                  {/* Table Header - No border, just background shift */}
                  <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-[#fafafa] text-xs font-bold uppercase tracking-wider text-[#64748b]">
                    <div className="col-span-5">文件名</div>
                    <div className="col-span-3">修改日期</div>
                    <div className="col-span-2 text-right">大小</div>
                    <div className="col-span-2 text-right">操作</div>
                  </div>

                  {/* File Items - 64px min height for editorial feel */}
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="grid grid-cols-12 gap-4 px-8 py-5 min-h-[64px] hover:bg-[#fafafa] transition-colors cursor-pointer group"
                      onClick={() => {
                        if (file.type === 'file') {
                          setPreviewFile(file);
                        } else if (file.type === 'folder') {
                          // 进入文件夹
                          setCurrentFolderId(file.id);
                          setFolderPath(prev => [...prev, { id: file.id, name: file.filename }]);
                        }
                      }}
                    >
                      <div className="col-span-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
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
                      <div className="col-span-3 flex items-center text-sm text-[#64748b]">
                        {formatDate(file.created_at)}
                  </div>
                      <div className="col-span-2 flex items-center justify-end text-sm font-medium text-[#0f172a]">
                        {file.type === 'folder' ? '—' : formatFileSize(file.size)}
                  </div>
                      <div className="col-span-2 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 text-[#64748b] hover:bg-[#f6f6f8] hover:text-[#0f172a] rounded-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameFile(file);
                          }}
                          title="重命名"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {file.type === 'file' && (
                          <button 
                            className="p-2 text-[#1121d4] hover:bg-[#1121d4]/10 rounded-lg transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareFile(file);
                            }}
                            title="分享"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          className="p-2 text-[#ef4444] hover:bg-red-50 rounded-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file);
                          }}
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              <div className="grid grid-cols-4 gap-4 p-6">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="group p-4 hover:bg-[#fafafa] rounded-xl transition-all cursor-pointer"
                    onClick={() => {
                      if (file.type === 'file') {
                        setPreviewFile(file);
                      }
                    }}
                  >
                    <div className="w-full aspect-square bg-[#f6f6f8] rounded-lg flex items-center justify-center mb-3">
                      <div className="w-16 h-16">
                        {getFileIcon(file.type, file.mime_type)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[#0f172a] truncate mb-1">
                      {file.filename}
                    </div>
                    <div className="text-xs text-[#64748b]">
                      {file.type === 'folder' ? '文件夹' : formatFileSize(file.size)}
                    </div>
                    <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="flex-1 p-2 text-[#64748b] hover:bg-white rounded-lg transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameFile(file);
                        }}
                        title="重命名"
                      >
                        <Edit3 className="h-4 w-4 mx-auto" />
                      </button>
                      {file.type === 'file' && (
                        <button 
                          className="flex-1 p-2 text-[#1121d4] hover:bg-white rounded-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareFile(file);
                          }}
                          title="分享"
                        >
                          <Share2 className="h-4 w-4 mx-auto" />
                        </button>
                      )}
                      <button 
                        className="flex-1 p-2 text-[#ef4444] hover:bg-white rounded-lg transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file);
                        }}
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </main>
      </div>

      {/* Share Dialog */}
      {shareDialogOpen && selectedFile && (
        <ShareDialog
          fileId={selectedFile.id}
          fileName={selectedFile.filename}
          onClose={handleCloseShareDialog}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="删除文件"
        description={`确定要删除 "${fileToDelete?.filename}" 吗？文件将被移入回收站，可在30天内恢复。`}
        confirmText="删除"
        cancelText="取消"
        variant="warning"
      />

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onConfirm={handleCreateFolder}
      />

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        onConfirm={confirmRename}
        currentName={fileToRename?.filename || ""}
        fileIcon={fileToRename ? getFileIcon(fileToRename.type, fileToRename.mime_type) : undefined}
      />

      {/* Smart Upload Dialog */}
      <SmartUploadDialog
        open={smartUploadOpen}
        onClose={() => setSmartUploadOpen(false)}
        onSuccess={() => {
          setSmartUploadOpen(false);
          fetchFiles();
          setToast({ open: true, message: "文件上传成功", type: "success" });
        }}
        parentId={currentFolderId}
      />

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

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
