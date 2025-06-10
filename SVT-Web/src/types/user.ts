// 用户相关类型定义

export interface User {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  roles: string[];
  permissions?: string[];
  createTime?: string;
  updateTime?: string;
}

export interface UserProfile extends User {
  nickname?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  address?: string;
  remark?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  captcha?: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  captcha: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  captcha: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserListParams {
  page: number;
  pageSize: number;
  username?: string;
  email?: string;
  status?: number;
  roleId?: number;
  startTime?: string;
  endTime?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email?: string;
  nickname?: string;
  phone?: string;
  roleIds?: number[];
  status?: number;
  remark?: string;
}

export interface UpdateUserRequest {
  id: number;
  username?: string;
  email?: string;
  nickname?: string;
  phone?: string;
  avatar?: string;
  roleIds?: number[];
  status?: number;
  remark?: string;
} 