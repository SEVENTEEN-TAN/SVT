/**
 * 认证相关API接口
 */
import { api } from '@/utils/request';
import type { LoginRequest, LoginResponse, User } from '@/types/user';

/**
 * 用户登录
 * @param credentials 登录凭据
 * @returns 登录响应
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', {
    loginId: credentials.loginId,
    password: credentials.password,
    rememberMe: credentials.rememberMe,
  });
  return response;
};

/**
 * 用户退出登录
 * @returns 退出登录响应
 */
export const logout = async (): Promise<void> => {
  try {
    await api.get('/auth/logout');
  } catch (error) {
    // 即使后端退出失败，前端也要清除本地状态
    console.warn('后端退出登录失败，但前端将继续清除本地状态:', error);
  }
};

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/user/profile');
  return response;
};

/**
 * 刷新Token（如果后端支持）
 * @returns 新的Token信息
 */
export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await api.post<{ accessToken: string }>('/auth/refresh');
  return response;
};

/**
 * 检查Token有效性
 * @returns Token是否有效
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    await api.get('/auth/validate');
    return true;
  } catch {
    return false;
  }
}; 