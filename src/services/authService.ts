// src/services/authService.ts
import apiClient from '@/lib/api';

export interface LoginRequest {
  username: string; // 或者 email，取决于你后端接收的字段
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: number;
    username: string;
    email?: string;
  };
  // 根据你的后端实际返回结构调整，比如可能还有 code, message 等
}

// 登录函数
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  // 注意：apiClient 的响应拦截器已经返回了 response.data，所以这里直接得到的就是数据
  const response: LoginResponse = await apiClient.post('/login', data);
  console.log('登录响应:', response);
  return response;
};

// 注册函数 (可选，稍后可以用)
export const register = async (data: LoginRequest & { email?: string }): Promise<any> => {
  const response = await apiClient.post('/register', data);
  console.log('注册响应:', response);
  return response;
};