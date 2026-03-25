import { useState, useRef, useEffect } from "react";
import { X, Upload, FileIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { calculateFileHash, createFileChunks } from "@/utils/fileHash";
import { checkFile, uploadChunk, mergeChunks, uploadFile } from "@/services/fileService";
import { formatFileSize } from "@/utils/fileUtils";

interface SmartUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentId?: number | null;
  droppedFiles?: File[];
  onDroppedFilesHandled?: () => void;
}

interface UploadTask {
  file: File;
  hash: string;
  status: 'hashing' | 'checking' | 'uploading' | 'merging' | 'success' | 'error';
  progress: number;
  message: string;
  uploadedChunks?: number[];
  totalChunks?: number;
  useChunked?: boolean; // 是否使用分片上传
}

export default function SmartUploadDialog({
  open,
  onClose,
  onSuccess,
  parentId,
  droppedFiles = [],
  onDroppedFilesHandled,
}: SmartUploadDialogProps) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setIsDragging(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && droppedFiles.length > 0) {
      const dt = new DataTransfer();
      droppedFiles.forEach((file) => dt.items.add(file));
      handleFileSelect(dt.files);
      onDroppedFilesHandled?.();
    }
  }, [open, droppedFiles, onDroppedFilesHandled]);

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
  const CHUNKED_THRESHOLD = 10 * 1024 * 1024; // 10MB 以上使用分片上传

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newTasks: UploadTask[] = Array.from(files).map(file => ({
      file,
      hash: '',
      status: 'hashing',
      progress: 0,
      message: '计算文件哈希...',
      useChunked: file.size > CHUNKED_THRESHOLD,
    }));

    setTasks(prev => [...prev, ...newTasks]);

    // 开始处理每个文件
    newTasks.forEach((task, index) => {
      processFile(task, tasks.length + index);
    });
  };

  const processFile = async (task: UploadTask, taskIndex: number) => {
    try {
      // 1. 计算文件 Hash
      updateTask(taskIndex, { status: 'hashing', message: '计算文件哈希...' });
      const hash = await calculateFileHash(task.file);
      updateTask(taskIndex, { hash });

      // 2. 检查文件（秒传 + 断点续传）
      updateTask(taskIndex, { status: 'checking', message: '检查文件状态...' });
      const checkResult = await checkFile({
        hash,
        filename: task.file.name,
        size: task.file.size,
        parent_id: parentId,
      });

      if (checkResult.status === 'exists') {
        // 秒传成功
        updateTask(taskIndex, {
          status: 'success',
          progress: 100,
          message: '秒传成功！',
        });
        // 延迟让用户看到成功提示后再触发回调
        setTimeout(() => onSuccess(), 1200);
        return;
      }

      // 3. 根据文件大小和检查结果决定上传方式
      const useChunked = task.file.size > CHUNKED_THRESHOLD || checkResult.status === 'partial';

      if (useChunked) {
        // 使用分片上传
        await uploadWithChunks(task, taskIndex, hash, checkResult.uploaded_chunks || []);
      } else {
        // 使用普通上传
        await uploadNormally(task, taskIndex);
      }

      // 延迟让用户看到成功提示后再触发回调
      setTimeout(() => onSuccess(), 1200);
    } catch (error: any) {
      console.error('上传失败:', error);
      updateTask(taskIndex, {
        status: 'error',
        message: error.response?.data?.error || error.message || '上传失败',
      });
    }
  };

  // 普通上传（小文件）
  const uploadNormally = async (task: UploadTask, taskIndex: number) => {
    updateTask(taskIndex, {
      status: 'uploading',
      progress: 10,
      message: '上传中...',
    });

    console.log('普通上传 - parentId:', parentId);
    const formData = new FormData();
    formData.append('file', task.file);
    if (parentId !== null && parentId !== undefined) {
      formData.append('parent_id', parentId.toString());
      console.log('已添加 parent_id 到 FormData:', parentId);
    } else {
      console.log('parentId 为空，上传到根目录');
    }

    await uploadFile(formData);

    updateTask(taskIndex, {
      status: 'success',
      progress: 100,
      message: '上传成功！',
    });
  };

  // 分片上传（大文件）
  const uploadWithChunks = async (
    task: UploadTask,
    taskIndex: number,
    hash: string,
    uploadedChunks: number[]
  ) => {
    const chunks = createFileChunks(task.file, CHUNK_SIZE);
    const totalChunks = chunks.length;

    updateTask(taskIndex, {
      status: 'uploading',
      totalChunks,
      uploadedChunks,
      message: `分片上传中 (${uploadedChunks.length}/${totalChunks})`,
    });

    // 上传未完成的分片
    for (let i = 0; i < chunks.length; i++) {
      if (uploadedChunks.includes(i)) {
        continue;
      }

      await uploadChunk({
        file: chunks[i],
        hash,
        chunk_index: i,
        total_chunks: totalChunks,
      });

      uploadedChunks.push(i);
      const progress = Math.floor((uploadedChunks.length / totalChunks) * 90);
      updateTask(taskIndex, {
        progress,
        uploadedChunks,
        message: `分片上传中 (${uploadedChunks.length}/${totalChunks})`,
      });
    }

    // 合并分片
    updateTask(taskIndex, {
      status: 'merging',
      progress: 95,
      message: '合并文件中...',
    });

    await mergeChunks({
      hash,
      filename: task.file.name,
      total_chunks: totalChunks,
      parent_id: parentId,
      mime_type: task.file.type,
    });

    updateTask(taskIndex, {
      status: 'success',
      progress: 100,
      message: '上传成功！',
    });
  };

  const updateTask = (index: number, updates: Partial<UploadTask>) => {
    setTasks(prev => {
      const newTasks = [...prev];
      newTasks[index] = { ...newTasks[index], ...updates };
      return newTasks;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getStatusIcon = (status: UploadTask['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileIcon className="w-5 h-5 text-[#1121d4]" />;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e2e8f0]">
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">智能上传</h2>
            <p className="text-sm text-[#64748b] mt-1">
              自动识别文件大小，智能选择上传方式
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f6f6f8] rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-[#64748b]" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? 'border-[#1121d4] bg-[#1121d4]/5'
                : 'border-[#e2e8f0] hover:border-[#1121d4]/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
            <p className="text-lg font-semibold text-[#0f172a] mb-2">
              拖拽文件到此处，或点击选择文件
            </p>
            <p className="text-sm text-[#64748b] mb-1">
              • 小文件（&lt;10MB）：快速上传
            </p>
            <p className="text-sm text-[#64748b] mb-1">
              • 大文件（≥10MB）：自动分片、秒传、断点续传
            </p>
            <p className="text-sm text-[#64748b] mb-4">
              • 支持多文件同时上传
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-[#1121d4] hover:bg-[#0d19a8] text-white font-semibold rounded-xl transition-all"
            >
              选择文件
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        </div>

        {/* Task List */}
        {tasks.length > 0 && (
          <div className="flex-1 overflow-auto px-6 pb-6">
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="border border-[#e2e8f0] rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#0f172a] truncate">
                            {task.file.name}
                          </p>
                          {task.useChunked && (
                            <span className="text-xs px-2 py-0.5 bg-[#1121d4]/10 text-[#1121d4] rounded-full">
                              分片
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-[#64748b] ml-2">
                          {formatFileSize(task.file.size)}
                        </span>
                      </div>
                      <p className="text-sm text-[#64748b] mb-2">{task.message}</p>
                      {task.status !== 'success' && task.status !== 'error' && (
                        <div className="w-full bg-[#e2e8f0] rounded-full h-2">
                          <div
                            className="bg-[#1121d4] h-2 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
