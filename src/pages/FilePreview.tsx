import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Download, Share2, Star, Image as ImageIcon } from "lucide-react";
import { getFileById } from "@/services/fileService";
import type { FileItem } from "@/services/fileService";
import { formatFileSize, formatDate } from "@/utils/fileUtils";

export default function FilePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchFileDetails();
    }
  }, [id]);

  const fetchFileDetails = async () => {
    try {
      const response = await getFileById(Number(id));
      setFile(response);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "加载失败");
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    if (!file) return;
    const downloadUrl = `/files/preview/${file.id}`;
    window.open(downloadUrl, '_blank');
  };

  const getPreviewUrl = () => {
    if (!file) return "";
    return `/files/preview/${file.id}`;
  };

  const isImage = (mimeType: string) => {
    return mimeType.startsWith('image/');
  };

  const isVideo = (mimeType: string) => {
    return mimeType.startsWith('video/');
  };

  const isAudio = (mimeType: string) => {
    return mimeType.startsWith('audio/');
  };

  const isPDF = (mimeType: string) => {
    return mimeType === 'application/pdf';
  };

  const isText = (mimeType: string) => {
    return mimeType.startsWith('text/') || 
           ['application/json', 'application/xml'].includes(mimeType);
  };

  const renderPreview = () => {
    if (!file) return null;

    const previewUrl = getPreviewUrl();

    if (isImage(file.mime_type)) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <img 
            src={previewUrl} 
            alt={file.filename}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      );
    }

    if (isVideo(file.mime_type)) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <video 
            controls 
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            src={previewUrl}
          >
            您的浏览器不支持视频播放
          </video>
        </div>
      );
    }

    if (isAudio(file.mime_type)) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#1121d4]/10 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-[#1121d4]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a]">{file.filename}</h3>
                  <p className="text-sm text-[#64748b]">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <audio 
                controls 
                className="w-full"
                src={previewUrl}
              >
                您的浏览器不支持音频播放
              </audio>
            </div>
          </div>
        </div>
      );
    }

    if (isPDF(file.mime_type)) {
      return (
        <div className="flex-1 p-4">
          <iframe 
            src={previewUrl}
            className="w-full h-full rounded-lg"
            title={file.filename}
          />
        </div>
      );
    }

    if (isText(file.mime_type)) {
      return (
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
            <iframe 
              src={previewUrl}
              className="w-full min-h-[600px] border-0"
              title={file.filename}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#64748b] mb-4">此文件类型不支持预览</p>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-[#1121d4] hover:bg-[#0d19a8] text-white font-semibold rounded-xl transition-all"
          >
            下载文件
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1a1d2e] flex items-center justify-center z-50">
        <div className="text-white text-lg">加载中...</div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="fixed inset-0 bg-[#1a1d2e] flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-white text-lg mb-4">{error || "文件不存在"}</p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-white text-[#1a1d2e] font-semibold rounded-xl"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#1a1d2e] flex z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-[#1a1d2e]/95 backdrop-blur-sm flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">{file.filename}</span>
          <span className="text-[#94a3b8] text-sm">文件元数据与属性</span>
        </div>
        <button
          onClick={handleClose}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex pt-16">
        {/* Preview Area */}
        <div className="flex-1 flex flex-col">
          {renderPreview()}

        </div>

        {/* Right Sidebar - File Details */}
        <div className="w-80 bg-white flex flex-col">
          <div className="p-6 border-b border-[#e2e8f0]">
            <h2 className="text-xl font-bold text-[#0f172a] mb-1">文件详情</h2>
            <p className="text-sm text-[#64748b]">文件元数据与属性</p>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {/* File Name */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2">
                文件名
              </label>
              <p className="text-sm font-semibold text-[#0f172a]">{file.filename}</p>
            </div>

            {/* Size and Type */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2">
                  大小
                </label>
                <p className="text-sm font-semibold text-[#0f172a]">{formatFileSize(file.size)}</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2">
                  类型
                </label>
                <p className="text-sm font-semibold text-[#0f172a]">
                  {file.mime_type.split('/')[1]?.toUpperCase() || '未知'}
                </p>
              </div>
            </div>

            {/* Created Date */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2">
                创建时间
              </label>
              <p className="text-sm font-semibold text-[#0f172a]">{formatDate(file.created_at)}</p>
            </div>

            {/* Dimensions for images */}
            {isImage(file.mime_type) && (
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2">
                  尺寸
                </label>
                <p className="text-sm font-semibold text-[#0f172a]">3840 x 2160</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-[#e2e8f0]">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#64748b] hover:bg-[#f6f6f8] rounded-lg transition-all">
                <Share2 className="w-4 h-4" />
                分享链接
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#64748b] hover:bg-[#f6f6f8] rounded-lg transition-all">
                <Star className="w-4 h-4" />
                添加收藏
              </button>
            </div>
          </div>

          {/* Download Button */}
          <div className="p-6 border-t border-[#e2e8f0]">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1121d4] hover:bg-[#0d19a8] text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              下载原图
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
