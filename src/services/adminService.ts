import apiClient from '@/lib/api';

// ==================== 类型定义 ====================

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  avatar: string;
  nickname: string;
  gender: 'male' | 'female' | 'other' | '';
  bio: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminFile {
  id: number;
  user_id: number;
  filename: string;
  save_path: string;
  size: number;
  mime_type: string;
  type: 'file' | 'folder';
  parent_id: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  total_files: number;
  total_storage_size: number;
  deleted_files: number;
}

export interface UserDetail {
  user: AdminUser;
  file_count: number;
  total_size: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface UserListParams extends PaginationParams {
  role?: 'user' | 'admin';
  status?: 'active' | 'inactive';
}

export interface FileListParams extends PaginationParams {
  user_id?: number;
  type?: 'file' | 'folder';
}

export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ==================== 系统统计接口 ====================

export const getSystemStats = async (): Promise<ApiResponse<SystemStats>> => {
  return await apiClient.get('/admin/stats');
};

// ==================== 用户管理接口 ====================

export const getAllUsers = async (params: UserListParams): Promise<PaginatedResponse<AdminUser>> => {
  return await apiClient.get('/admin/users', { params });
};

export const getUserDetail = async (id: number): Promise<ApiResponse<UserDetail>> => {
  return await apiClient.get(`/admin/users/${id}`);
};

export const updateUserStatus = async (id: number, isActive: boolean): Promise<ApiResponse<null>> => {
  return await apiClient.put(`/admin/users/${id}/status`, { is_active: isActive });
};

export const updateUserRole = async (id: number, role: 'user' | 'admin'): Promise<ApiResponse<null>> => {
  return await apiClient.put(`/admin/users/${id}/role`, { role });
};

export const resetUserPassword = async (id: number, newPassword: string): Promise<ApiResponse<null>> => {
  return await apiClient.put(`/admin/users/${id}/password`, { new_password: newPassword });
};

export const deleteUser = async (id: number): Promise<ApiResponse<null>> => {
  return await apiClient.delete(`/admin/users/${id}`);
};

// ==================== 文件管理接口 ====================

export const getAllFiles = async (params: FileListParams): Promise<PaginatedResponse<AdminFile>> => {
  return await apiClient.get('/admin/files', { params });
};

export const getUserFiles = async (userId: number, params: PaginationParams): Promise<PaginatedResponse<AdminFile>> => {
  return await apiClient.get(`/admin/users/${userId}/files`, { params });
};

export const deleteFile = async (fileId: number): Promise<ApiResponse<null>> => {
  return await apiClient.delete(`/admin/files/${fileId}`);
};
