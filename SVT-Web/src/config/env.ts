/**
 * 环境变量配置管理
 * 统一管理所有环境变量，提供类型安全和默认值
 */

export interface AppConfig {
  // 应用基本信息
  appTitle: string;
  appDescription: string;
  appVersion: string;
  appEnv: string;

  // 后端API配置
  apiBaseUrl: string;
  apiTimeout: number;

  // 管理员联系信息
  adminEmail: string;
  adminPhone?: string;
  supportUrl?: string;

  // 功能开关
  enableMock: boolean;
  enableDebug: boolean;

  // 主题配置
  themePrimaryColor: string;
  themeMode: 'light' | 'dark';
}

/**
 * 获取环境变量值，支持默认值
 */
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

/**
 * 获取布尔类型环境变量
 */
const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

/**
 * 获取数字类型环境变量
 */
const getNumberEnvVar = (key: string, defaultValue: number = 0): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * 应用配置对象
 */
export const appConfig: AppConfig = {
  // 应用基本信息
  appTitle: getEnvVar('VITE_APP_TITLE', 'SVT 管理系统'),
  appDescription: getEnvVar(
    'VITE_APP_DESCRIPTION', 
    '一个现代化、高效、可靠的企业级解决方案，助力您的业务增长与数字化转型。'
  ),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appEnv: getEnvVar('VITE_APP_ENV', 'development'),

  // 后端API配置
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080'),
  apiTimeout: getNumberEnvVar('VITE_API_TIMEOUT', 10000),

  // 管理员联系信息
  adminEmail: getEnvVar('VITE_ADMIN_EMAIL', 'admin@svt.com'),
  adminPhone: getEnvVar('VITE_ADMIN_PHONE') || undefined,
  supportUrl: getEnvVar('VITE_SUPPORT_URL') || undefined,

  // 功能开关
  enableMock: getBooleanEnvVar('VITE_ENABLE_MOCK', false),
  enableDebug: getBooleanEnvVar('VITE_ENABLE_DEBUG', true),

  // 主题配置
  themePrimaryColor: getEnvVar('VITE_THEME_PRIMARY_COLOR', '#1890ff'),
  themeMode: (getEnvVar('VITE_THEME_MODE', 'light') as 'light' | 'dark'),
};

/**
 * 开发环境检查
 */
export const isDevelopment = appConfig.appEnv === 'development';

/**
 * 生产环境检查
 */
export const isProduction = appConfig.appEnv === 'production';

/**
 * 调试模式检查
 */
export const isDebugMode = appConfig.enableDebug && isDevelopment;

/**
 * 获取管理员联系信息文本
 */
export const getAdminContactText = (): string => {
  const parts = ['请联系管理员'];
  
  if (appConfig.adminEmail) {
    parts.push(`：${appConfig.adminEmail}`);
  }
  
  if (appConfig.adminPhone) {
    parts.push(`，电话：${appConfig.adminPhone}`);
  }
  
  return parts.join('');
};

export default appConfig; 