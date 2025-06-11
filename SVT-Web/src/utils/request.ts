import axios from 'axios';
import type { 
  AxiosInstance, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import { message } from 'antd';

// 定义响应数据结构
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加Authorization header
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求时间戳（避免缓存）
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    
    // 成功响应
    if (data.code === 200 || data.success) {
      return response;
    }
    
    // 业务错误
    message.error(data.message || '操作失败');
    return Promise.reject(new Error(data.message || '操作失败'));
  },
  (error: AxiosError) => {
    // 网络错误或HTTP状态码错误
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转登录
          // 注意：这里不直接操作localStorage，而是通过authStore统一处理
          // 避免与TokenManager的处理逻辑冲突
          console.warn('API请求返回401，Token可能已过期');
          
          // 延迟执行，避免与TokenManager的处理冲突
          setTimeout(() => {
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
              localStorage.removeItem('expiryDate');
              message.warning('您已超过5分钟未操作，请重新登录');
          window.location.href = '/login';
            }
          }, 100);
          break;
        case 403:
          message.error('没有权限访问该资源');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error((data as ApiResponse)?.message || `请求失败(${status})`);
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      message.error('网络连接失败，请检查网络');
    } else {
      // 其他错误
      message.error(error.message || '请求失败');
    }
    
    return Promise.reject(error);
  }
);

// 封装常用请求方法
export const api = {
  get: <T = unknown>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => {
    return request.get<ApiResponse<T>>(url, config).then(res => res.data.data);
  },
  
  post: <T = unknown>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> => {
    return request.post<ApiResponse<T>>(url, data, config).then(res => res.data.data);
  },
  
  put: <T = unknown>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> => {
    return request.put<ApiResponse<T>>(url, data, config).then(res => res.data.data);
  },
  
  delete: <T = unknown>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => {
    return request.delete<ApiResponse<T>>(url, config).then(res => res.data.data);
  },
  
  upload: <T = unknown>(url: string, formData: FormData, config?: InternalAxiosRequestConfig): Promise<T> => {
    return request.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data.data);
  },
};

export default request; 