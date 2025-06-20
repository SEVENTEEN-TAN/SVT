/**
 * 认证相关API接口
 */
import { api, request } from '@/utils/request';
import type { LoginRequest, LoginResponse, User } from '@/types/user';
import type { 
  GetUserOrgResponse, 
  GetUserRoleResponse, 
  GetUserDetailsRequest, 
  UserDetailCache 
} from '@/types/org-role';

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

/**
 * 获取当前用户的机构列表
 * @returns 机构列表
 */
export const getUserOrgList = async (): Promise<GetUserOrgResponse> => {
  const response = await api.get<GetUserOrgResponse>('/login/get-user-org-list');
  return response;
};

/**
 * 获取当前用户的角色列表
 * @returns 角色列表
 */
export const getUserRoleList = async (): Promise<GetUserRoleResponse> => {
  const response = await api.get<GetUserRoleResponse>('/login/get-user-role');
  return response;
};

/**
 * 获取当前用户详情
 * @param params 机构ID和角色ID
 * @returns 用户详情
 */
export const getUserDetails = async (params: GetUserDetailsRequest): Promise<UserDetailCache> => {
  const response = await api.post<UserDetailCache>('/login/get-user-details', params);
  return response;
};

/**
 * 验证用户状态
 * 用于Dashboard页面验证用户当前状态，包括用户是否被禁用、Token是否有效等
 * @returns 用户状态验证结果
 */
export interface UserStatusVerificationResult {
  isValid: boolean;
  message: string;
}

// 后端标准响应格式
interface ApiResponse {
  code: number;
  message: string;
  data: any;
  success: boolean;
  timestamp: number;
  traceId: string;
}

export const verifyUserStatus = async (): Promise<UserStatusVerificationResult> => {
  try {
    // 关键修复：使用我们自定义的、带拦截器的 request 实例
    const response = await request.post<ApiResponse>('/login/verify-user-status');
    const data = response.data; // 这里是完整的响应体 { code, message, data, success, ... }
    
    if (data.success) {
      return {
        isValid: true,
        message: data.message || '用户状态正常'
      };
    } else {
      // 对于业务逻辑上的失败（例如，code不是200但HTTP是200），也向上抛出错误
      throw new Error(data.message || '用户状态异常');
    }
  } catch (error: any) {
    // 这个catch现在能捕获到所有来自拦截器的错误
    // 拦截器已经处理了message.error的显示和跳转，这里只需要继续抛出，让useUserStatus的逻辑能感知到错误即可
    const errorMessage = error.response?.data?.message || error.message || '用户状态验证失败';
    throw new Error(errorMessage);
  }
}; 