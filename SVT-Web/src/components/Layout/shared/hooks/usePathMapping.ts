import { useMemo } from 'react';
import type { MenuItem, PathMaps } from '../types/layout';
import { generatePathMaps, getTabName as getTabNameUtil } from '../utils/layoutUtils';

// 路径映射Hook
export const usePathMapping = (menuTrees?: MenuItem[]) => {
  // 🔧 动态获取路径映射
  const pathMaps = useMemo(() => {
    return generatePathMaps(menuTrees || []);
  }, [menuTrees]);

  // 根据路径获取Tab名称的函数
  const getTabName = useMemo(() => {
    return (path: string): string => {
      return getTabNameUtil(path, pathMaps, menuTrees);
    };
  }, [pathMaps, menuTrees]);

  return {
    pathMaps,
    getTabName,
  };
}; 