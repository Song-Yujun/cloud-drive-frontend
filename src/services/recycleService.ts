import apiClient from "@/lib/api";
import type { FileItem } from "./fileService";

// 回收站列表响应
export interface RecycleBinResponse {
  code: number;
  msg: string;
  data: FileItem[];
}

// 通用响应
export interface CommonResponse {
  code: number;
  msg: string;
}

// 获取回收站文件列表
export const getRecycleBinFiles = async (): Promise<RecycleBinResponse> => {
  const response: RecycleBinResponse = await apiClient.get('/recycle/list');
  return response;
};

// 恢复文件
export const restoreFile = async (fileId: number): Promise<CommonResponse> => {
  const response: CommonResponse = await apiClient.put(`/recycle/restore/${fileId}`);
  return response;
};

// 永久删除文件
export const permanentDeleteFile = async (fileId: number): Promise<CommonResponse> => {
  const response: CommonResponse = await apiClient.delete(`/recycle/delete/${fileId}`);
  return response;
};

// 清空回收站
export const emptyRecycleBin = async (): Promise<CommonResponse> => {
  const response: CommonResponse = await apiClient.delete('/recycle/clear');
  return response;
};
