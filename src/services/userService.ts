import apiClient from '@/lib/api';

export interface UserProfile {
  ID: number;
  Username: string;
  Email: string;
  avatar: string;
  nickname: string;
  gender: 'male' | 'female' | 'other' | '';
  bio: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface UserInfoResponse {
  code: number;
  message: string;
  data: UserProfile;
}

export interface UpdateProfileRequest {
  nickname?: string;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// 获取用户信息
export const getUserInfo = async (): Promise<UserInfoResponse> => {
  const response: UserInfoResponse = await apiClient.get('/user/info');
  return response;
};

// 更新个人信息
export const updateProfile = async (profile: UpdateProfileRequest): Promise<UserInfoResponse> => {
  const response: UserInfoResponse = await apiClient.put('/user/profile', profile);
  return response;
};

// 上传头像
export const uploadAvatar = async (file: File): Promise<UserInfoResponse> => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response: UserInfoResponse = await apiClient.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

// 修改密码
export const changePassword = async (data: ChangePasswordRequest): Promise<{ code: number; message: string }> => {
  const response: { code: number; message: string } = await apiClient.put('/user/password', data);
  return response;
};
