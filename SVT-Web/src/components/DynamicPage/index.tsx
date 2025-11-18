import React, { Suspense, lazy, Component, useMemo } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import NotFoundPage from '@/pages/Error/NotFoundPage';
import { useAuth } from '@/stores/useAuth';

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

// 使用 import.meta.glob 预加载所有页面组件
// 这种方式可以被 Vite 正确分析 (注意：不能使用@别名，需要使用相对路径)
const pageModules = import.meta.glob('../../pages/**/index.tsx');

// 创建组件缓存映射
const componentCache = new Map<string, React.LazyExoticComponent<React.ComponentType<any>>>();

// 路径标准化工具函数（已移除，如需要可重新添加）

// 路径转换为组件路径的工具函数
const pathToComponentPath = (menuPath: string): string => {
  // 移除开头的斜杠，分割路径
  const segments = menuPath.split('/').filter(Boolean);
  
  if (segments.length < 2) {
    return '';
  }

  // 将路径段转换为Pascal命名（首字母大写）
  const convertToPascalCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // 构建组件路径：/system/menu -> ../../pages/System/Menu/index.tsx
  const [category, page] = segments;
  return `../../pages/${convertToPascalCase(category)}/${convertToPascalCase(page)}/index.tsx`;
};

// 动态加载组件的函数
const loadComponent = (componentPath: string): React.LazyExoticComponent<React.ComponentType<any>> | null => {
  try {
    // 检查组件缓存
    if (componentCache.has(componentPath)) {
      return componentCache.get(componentPath)!;
    }

    // 检查模块是否存在
    if (pageModules[componentPath]) {
      const LazyComponent = lazy(() => pageModules[componentPath]() as Promise<{ default: React.ComponentType<any> }>);
      componentCache.set(componentPath, LazyComponent);
      return LazyComponent;
    }

    return null;
  } catch (error) {
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
  menuSort?: number;
  children?: MenuItem[];
}

// 基于后端菜单数据创建动态组件映射
const createDynamicPageMap = (menuTrees: MenuItem[]) => {
  const pageMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>> | undefined> = {};

  const processMenuTree = (menus: MenuItem[]) => {
    menus.forEach(menu => {
      if (menu.menuPath) {
        const originalPath = menu.menuPath;
        const componentPath = pathToComponentPath(originalPath);

        if (componentPath) {
          try {
            const Component = loadComponent(componentPath);
            if (Component) {
              // 只支持原始路径，严格匹配
              pageMap[originalPath] = Component;
            }
          } catch (error) {
            console.error(`组件映射失败: ${originalPath}`, error);
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

// 页面加载组件 - 等待用户数据恢复
const PageLoading: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px'
  }}>
    <div>正在加载页面...</div>
  </div>
);

// 构建权限路径索引的优化函数
const buildPermissionIndex = (menus: MenuItem[]): Set<string> => {
  const paths = new Set<string>();
  
  const traverse = (items: MenuItem[]) => {
    items.forEach(item => {
      if (item.menuPath) paths.add(item.menuPath);
      if (item.children) traverse(item.children);
    });
  };
  
  traverse(menus);
  return paths;
};

// 动态页面组件
const DynamicPage: React.FC = () => {
  const location = useLocation();
  const { currentUser: user, isAuthenticated, isLoading } = useAuth();
  const currentPath = location.pathname;

  // 如果用户未认证，显示404
  if (!isAuthenticated) {
    return <NotFoundPage />;
  }

  // 如果正在加载或用户数据还没有恢复，显示加载状态
  if (isLoading || !user) {
    return <PageLoading />;
  }

  // 🚀 优化：使用useMemo缓存权限索引，避免每次渲染都遍历菜单树
  const permissionPaths = useMemo(() => {
    return user?.menuTrees ? buildPermissionIndex(user.menuTrees as MenuItem[]) : new Set<string>();
  }, [user?.menuTrees]);

  // 🚀 优化：O(1)权限检查，替代O(n)递归遍历
  const hasPermission = permissionPaths.has(currentPath);

  // 如果没有权限，显示404
  if (!hasPermission) {
    return <NotFoundPage />;
  }

  // 🚀 优化：使用useMemo缓存页面映射，只有menuTrees变化时才重新计算
  const pageMap = useMemo(() => {
    return user?.menuTrees ? createDynamicPageMap(user.menuTrees as MenuItem[]) : {};
  }, [user?.menuTrees]);

  // 获取对应的页面组件（只支持精确匹配）
  const PageComponent = pageMap[currentPath];

  // 如果无法加载组件，统一显示404页面
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
