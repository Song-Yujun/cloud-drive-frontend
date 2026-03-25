// src/services/authService.ts
import apiClient from '@/lib/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    user_id?: number;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// 登录
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response: LoginResponse = await apiClient.post('/login', data);
  return response;
};

// 注册
export const register = async (data: LoginRequest & { email?: string }): Promise<any> => {
  const response = await apiClient.post('/register', data);
  return response;
};

// 忘记密码：发送验证码
export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<{ code: number; message?: string; msg?: string }> => {
  const response = await apiClient.post('/forgot-password', data);
  return response as unknown as { code: number; message?: string; msg?: string };
};

// 重置密码
export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<{ code: number; message?: string; msg?: string }> => {
  const response = await apiClient.post('/reset-password', data);
  return response as unknown as { code: number; message?: string; msg?: string };
};

// 登录后修改密码
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<{ code: number; message?: string; msg?: string }> => {
  const response = await apiClient.post('/user/change-password', data);
  return response as unknown as { code: number; message?: string; msg?: string };
};
