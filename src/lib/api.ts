// src/lib/api.ts
import axios from 'axios';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api', // 使用代理路径，Vite 会将 /api 请求转发到 http://localhost:8080
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动带上 Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理错误 (如 401 未登录、服务器未启动)
apiClient.interceptors.response.use(
  (response) => response.data, // 直接返回 data 部分
  (error) => {
    // 401 未授权：Token 过期或未登录
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 网络错误或服务器未启动
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || !error.response) {
      console.error('服务器连接失败，跳转到登录页');
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;