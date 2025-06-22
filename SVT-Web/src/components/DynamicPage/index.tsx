import React, { Suspense, lazy, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import NotFoundPage from '@/pages/Error/NotFoundPage';
import { useAuthStore } from '@/stores/authStore';

// 错误边界组件
interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('组件加载错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <NotFoundPage />;
    }

    return this.props.children;
  }
}

// 路径转换为组件路径的工具函数
const pathToComponentPath = (menuPath: string): string => {
  // 移除开头的斜杠，分割路径
  const segments = menuPath.split('/').filter(Boolean);
  
  if (segments.length < 2) {
    return '';
  }

  // 将路径段转换为Pascal命名（首字母大写）
  const convertToPascalCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // 构建组件路径：/system/menu -> /pages/System/Menu
  const [category, page] = segments;
  return `/pages/${convertToPascalCase(category)}/${convertToPascalCase(page)}`;
};

// 动态导入组件的函数
const importComponent = (componentPath: string) => {
  try {
    // 移除开头的斜杠，构建相对路径
    const relativePath = componentPath.startsWith('/') ? componentPath.substring(1) : componentPath;
    
    // 使用动态导入
    return lazy(() => import(`@/${relativePath}`).catch(error => {
      console.warn(`组件加载失败: @/${relativePath}`, error);
      // 组件加载失败时，抛出错误，让上层处理
      throw error;
    }));
  } catch (error) {
    console.error('动态导入失败:', error);
    return null;
  }
};

// 菜单项类型定义
interface MenuItem {
  menuId?: string;
  parentId?: string | null;
  menuNameZh?: string;
  menuNameEn?: string;
  menuPath?: string;
  menuIcon?: string;
  menuSort?: string;
  children?: MenuItem[];
}

// 基于后端菜单数据的动态组件映射
const createDynamicPageMap = (menuTrees: MenuItem[]) => {
  const pageMap: Record<string, React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>> = {};

  const processMenuTree = (menus: MenuItem[]) => {
    menus.forEach(menu => {
      if (menu.menuPath) {
        const path = menu.menuPath;
        const componentPath = pathToComponentPath(path);
        
        if (componentPath) {
          try {
            const Component = importComponent(componentPath);
            if (Component) {
              pageMap[path] = Component;
            }
          } catch {
            // 组件导入失败时，不添加到pageMap中，这样会统一显示404页面
            console.warn(`跳过无效组件路径: ${path} -> ${componentPath}`);
          }
        }
      }

      // 递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        processMenuTree(menu.children);
      }
    });
  };

  processMenuTree(menuTrees);
  return pageMap;
};

// 简单的占位组件，不显示任何加载状态
// 因为BasicLayout已经提供了全局的页面刷新状态
const PageLoading: React.FC = () => null;

// 动态页面组件
const DynamicPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const currentPath = location.pathname;

  // 递归检查用户是否有访问该路径的权限
  const checkPermission = (menus: MenuItem[], targetPath: string): boolean => {
    return menus.some(menu => {
      if (menu.menuPath === targetPath) {
        return true;
      }
      if (menu.children && menu.children.length > 0) {
        return checkPermission(menu.children, targetPath);
      }
      return false;
    });
  };

  const hasPermission = user?.menuTrees ? checkPermission(user.menuTrees as MenuItem[], currentPath) : false;

  // 如果没有权限，显示404
  if (!hasPermission) {
    return <NotFoundPage />;
  }

  // 基于用户菜单数据创建动态页面映射
  const pageMap = user?.menuTrees ? createDynamicPageMap(user.menuTrees as MenuItem[]) : {};

  // 获取对应的页面组件
  const PageComponent = pageMap[currentPath];

  // 如果无法加载组件（组件不存在或加载失败），统一显示404页面
  if (!PageComponent) {
    return <NotFoundPage />;
  }

  // 渲染对应的页面组件，包含错误边界处理
  return (
    <Suspense fallback={<PageLoading />}>
      <ErrorBoundary>
        <PageComponent />
      </ErrorBoundary>
    </Suspense>
  );
};

export default DynamicPage;
