import apiClient from "@/lib/api";

// 分享数据结构
export interface Share {
  id: number;
  user_id: number;
  file_id: number;
  share_code: string;
  password: string;
  expire_at: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  filename: string;          // 文件名
  is_file_exist: boolean;    // 文件是否存在
}

// 创建分享请求
export interface CreateShareRequest {
  file_id: number;
  password?: string;
  expire_days?: number; // 过期天数，0表示永久
}

// 创建分享响应
export interface CreateShareResponse {
  code: number;
  msg: string;
  data: {
    share: Share;
    share_url: string; // 完整的分享链接
  };
}

// 我的分享列表响应
export interface MySharesResponse {
  code: number;
  msg: string;
  data: Share[];
}

// 验证分享请求
export interface VerifyShareRequest {
  password?: string;
}

// 验证分享响应
export interface VerifyShareResponse {
  code: number;
  msg: string;
  data: {
    file_name: string;
    file_size: number;
    file_type: string;
    mime_type: string;
    created_at: string;
  };
}

// 创建分享
export const createShare = async (data: CreateShareRequest): Promise<CreateShareResponse> => {
  const response: CreateShareResponse = await apiClient.post('/shares', data);
  return response;
};

// 获取我的分享列表
export const getMyShares = async (): Promise<Share[]> => {
  const response: Share[] = await apiClient.get('/shares');
  return response;
};

// 取消分享
export const cancelShare = async (shareId: number): Promise<{ code: number; msg: string }> => {
  const response: { code: number; msg: string } = await apiClient.delete(`/shares/${shareId}`);
  return response;
};

// 验证分享码（公开接口，不需要登录）
export const verifyShare = async (
  shareCode: string,
  data?: VerifyShareRequest
): Promise<VerifyShareResponse> => {
  const response: VerifyShareResponse = await apiClient.post(`/s/${shareCode}/verify`, data || {});
  return response;
};

// 下载分享文件（公开接口）
export const downloadSharedFile = (shareCode: string, password?: string): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const url = new URL(`/s/${shareCode}/download`, baseUrl);
  if (password) {
    url.searchParams.append('password', password);
  }
  return url.toString();
};
