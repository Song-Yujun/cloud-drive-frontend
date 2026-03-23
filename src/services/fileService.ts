// src/services/fileService.ts
import apiClient from '@/lib/api';

export interface FileItem {
  id: number;
  user_id: number;
  filename: string;
  save_path: string;
  size: number;
  mime_type: string;
  type: 'file' | 'folder';
  parent_id: number | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  file_hash: string;
}

export interface FileListResponse {
  code: number;
  current_parent_id: number | null;
  data: FileItem[];
  msg: string;
  pageNum: number;
  pageSize: number;
  total: number;
}

// 获取文件列表
export const getFiles = async (params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  parentId?: number | null;
}): Promise<FileListResponse> => {
  const response: FileListResponse = await apiClient.get('/files', {
    params: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
      keyword: params?.keyword || '',
      parent_id: params?.parentId
    }
  });
  console.log('文件列表 API 响应:', response);
  return response;
};

// 上传文件 (简单版，后续可升级为分片)
export const uploadFile = async (formData: FormData) => {
  return apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// 新建文件夹
export const createFolder = async (filename: string, parentId?: number): Promise<{ data: FileItem; message: string }> => {
  const response: { data: FileItem; message: string } = await apiClient.post('/folders', { filename, parent_id: parentId });
  return response;
};

// 重命名文件/文件夹
export const renameFile = async (fileId: number, newName: string): Promise<{ message: string; new_name: string }> => {
  const response: { message: string; new_name: string } = await apiClient.post(`/files/rename`, { id: fileId, new_name: newName });
  return response;
};

// 获取单个文件详情
export const getFileById = async (fileId: number): Promise<FileItem> => {
  const response: FileItem = await apiClient.get(`/files/${fileId}`);
  return response;
};

// 删除文件/文件夹（移入回收站）
export const deleteFile = async (fileId: number): Promise<{ code: number; msg: string }> => {
  const response: { code: number; msg: string } = await apiClient.get(`/files/delete/${fileId}`);
  return response;
};

// 预览文件（返回 Blob）
export const previewFile = async (fileId: number): Promise<Blob> => {
  // 使用 axios 直接请求，因为需要 responseType: 'blob'
  const axios = (await import('axios')).default;
  const token = localStorage.getItem('token');
  
  const response = await axios.get(`/api/preview/${fileId}`, {
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};

// ==================== 分片上传相关 API ====================

export interface CheckFileResponse {
  status: 'exists' | 'partial' | 'new';
  message: string;
  data?: FileItem;
  uploaded_chunks?: number[];
}

// 检查文件（秒传 + 断点续传检测）
export const checkFile = async (params: {
  hash: string;
  filename: string;
  size: number;
  parent_id?: number | null;
}): Promise<CheckFileResponse> => {
  const response: CheckFileResponse = await apiClient.post('/files/check', params);
  return response;
};

// 上传单个分片
export const uploadChunk = async (params: {
  file: Blob;
  hash: string;
  chunk_index: number;
  total_chunks: number;
}): Promise<{ message: string; chunk_index: number }> => {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('hash', params.hash);
  formData.append('chunk_index', params.chunk_index.toString());
  formData.append('total_chunks', params.total_chunks.toString());

  const response: { message: string; chunk_index: number } = await apiClient.post('/files/chunk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

// 合并分片
export const mergeChunks = async (params: {
  hash: string;
  filename: string;
  total_chunks: number;
  parent_id?: number | null;
  mime_type: string;
}): Promise<{ message: string; data: FileItem }> => {
  const response: { message: string; data: FileItem } = await apiClient.post('/files/merge', params);
  return response;
};