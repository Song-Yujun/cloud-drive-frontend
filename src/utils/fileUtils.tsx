import { 
  File, 
  Folder, 
  Image as ImageIcon, 
  Film, 
  Music, 
  FileText, 
  Archive
} from "lucide-react";

// Indigo Vault Design System - File Icon Color Coding
export const getFileIcon = (type: string, mimeType?: string) => {
  if (type === 'folder') {
    return (
      <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
        <Folder className="h-5 w-5 text-blue-600" />
      </div>
    );
  }

  const mime = mimeType?.toLowerCase() || '';
  
  if (mime.includes('image')) {
    return (
      <div className="w-full h-full bg-purple-100 rounded-lg flex items-center justify-center">
        <ImageIcon className="h-5 w-5 text-purple-600" />
      </div>
    );
  }
  if (mime.includes('video')) {
    return (
      <div className="w-full h-full bg-amber-100 rounded-lg flex items-center justify-center">
        <Film className="h-5 w-5 text-amber-600" />
      </div>
    );
  }
  if (mime.includes('audio')) {
    return (
      <div className="w-full h-full bg-pink-100 rounded-lg flex items-center justify-center">
        <Music className="h-5 w-5 text-pink-600" />
      </div>
    );
  }
  if (mime.includes('pdf')) {
    return (
      <div className="w-full h-full bg-red-100 rounded-lg flex items-center justify-center">
        <FileText className="h-5 w-5 text-red-600" />
      </div>
    );
  }
  if (mime.includes('sheet') || mime.includes('excel')) {
    return (
      <div className="w-full h-full bg-emerald-100 rounded-lg flex items-center justify-center">
        <FileText className="h-5 w-5 text-emerald-600" />
      </div>
    );
  }
  if (mime.includes('text') || mime.includes('document')) {
    return (
      <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
        <FileText className="h-5 w-5 text-blue-600" />
      </div>
    );
  }
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('compressed')) {
    return (
      <div className="w-full h-full bg-orange-100 rounded-lg flex items-center justify-center">
        <Archive className="h-5 w-5 text-orange-600" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
      <File className="h-5 w-5 text-slate-500" />
    </div>
  );
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
