import axios from 'axios';
import type { 
  AxiosInstance, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import { AESCryptoUtils, isEncryptedData } from './crypto';
import { useAuthStore } from '../stores/authStore';
import { messageManager } from './messageManager';
import { clearStorageOnTokenExpired } from './localStorageManager';

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
  async (config: InternalAxiosRequestConfig) => {
    // 🔧 从Zustand persist获取token（优先）或localStorage（兼容旧数据）
    let token = null;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
      }
    } catch {
      // 兜底：从单独的localStorage获取（兼容旧数据）
      token = localStorage.getItem('token');
    }
    
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

    // AES加密处理
    if (AESCryptoUtils.isEnabled()) {
      const method = config.method?.toLowerCase() || '';
      
      // 对POST/PUT/PATCH请求的data进行加密
      if (config.data && ['post', 'put', 'patch'].includes(method)) {
        try {
          const encryptedData = await AESCryptoUtils.encryptForAPI(config.data);
          
          // 替换请求体为加密数据
          config.data = encryptedData;
          
          // 设置请求头标识加密
          if (config.headers) {
            config.headers['X-Encrypted'] = 'true';
            config.headers['Content-Type'] = 'application/json';
          }
        } catch (error) {
          console.error('请求数据AES加密失败:', error);
          throw new Error('请求数据加密失败');
        }
      }
      // 对所有API请求（包括GET）设置加密响应标识
      else if (config.url?.startsWith('/')) {
        if (config.headers) {
          config.headers['X-Encrypted'] = 'true';
        }
      }
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
  async (response: AxiosResponse<ApiResponse>) => {
    let { data } = response;
    
    // 🔓 AES解密处理
    // axios会自动将响应头转换为小写
    const encryptedHeader = response.headers['x-encrypted'];
    
    if (AESCryptoUtils.isEnabled() && encryptedHeader === 'true') {
      try {
        // 检查响应数据是否为加密格式
        if (isEncryptedData(data)) {
          const decryptedData = await AESCryptoUtils.decryptFromAPI(data);
          response.data = decryptedData;
          // 🔧 关键修复：更新本地data变量，以便后续成功判断使用解密后的数据
          data = decryptedData;
        }
      } catch (error) {
        console.error('响应数据AES解密失败:', error);
        throw new Error('响应数据解密失败');
      }
    }
    
    // 成功响应
    if (data.code === 200 || data.success === true) {
      return response;
    }
    
    // 业务错误
    const errorMessage = data.message || '操作失败';

    // 关键修复：检查业务错误消息是否和认证相关
    const authErrorKeywords = ['JWT', '认证失败', 'Token', '过期', '登录'];
    const isAuthError = authErrorKeywords.some(keyword => errorMessage.includes(keyword));

    if (isAuthError) {
      // 如果是认证相关错误，则触发登出逻辑
      console.warn(`检测到业务层面的认证错误: ${errorMessage}`);
      
      // 清理localStorage
      clearStorageOnTokenExpired();
      
      useAuthStore.getState().logout({ message: errorMessage });
      return Promise.reject(new Error(errorMessage));
    }

    // 对于其他普通业务错误，只显示消息
    messageManager.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  },
  (error: AxiosError) => {
    // 网络错误或HTTP状态码错误
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401: {
          console.warn('API请求返回401，Token可能已过期');
          
          // 🔧 关键优化：检查是否为verify-user-status请求
          const isVerifyUserStatus = error.config?.url?.includes('/verify-user-status');
          
          if (isVerifyUserStatus) {
            // verify-user-status返回401时，后端已将token加入黑名单
            // 只需清理前端状态，不再调用logout API
            console.log('🔧 verify-user-status返回401，直接清理前端状态（后端已处理token黑名单）');
            
            // 清理localStorage
            clearStorageOnTokenExpired();
            
            useAuthStore.getState().clearAuthState(); // 直接清理状态，不调用logout API
            
            // 显示一次消息即可
            const errorMsg = (data as ApiResponse)?.message || '登录已过期，请重新登录';
            setTimeout(() => {
              messageManager.warning(errorMsg);
            }, 100);
          } else {
            // 其他API的401，正常处理
            const errorMsg = (data as ApiResponse)?.message || '登录已过期，请重新登录';
            
            // 清理localStorage
            clearStorageOnTokenExpired();
            
            useAuthStore.getState().logout();
            setTimeout(() => {
              messageManager.warning(errorMsg);
            }, 100);
          }
          break;
        }
        case 403:
          messageManager.error('没有权限访问该资源');
          break;
        case 404:
          messageManager.error('请求的资源不存在');
          break;
        case 500:
          messageManager.error('服务器内部错误');
          break;
        default:
          messageManager.error((data as ApiResponse)?.message || `请求失败(${status})`);
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      messageManager.error('网络连接失败，请检查网络');
    } else {
      // 其他错误
      messageManager.error(error.message || '请求失败');
    }
    
    return Promise.reject(error);
  }
);

// 封装常用请求方法
export { request };

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