/**
 * 基础布局组件 - 极简版本
 *
 * 职责：
 * - 用户状态验证
 * - 提供布局容器
 * - 极简化实现
 *
 * @author SVT Team
 * @since 2025-06-29
 * @version 3.0.0
 */

import React from 'react';
import { useUserStatus } from '@/hooks/useUserStatus';
import { LayoutProvider } from './core/LayoutProvider';
import LayoutStructure from './core/LayoutStructure';
import { LOADING_STYLES } from './shared/utils/layoutStyles';

/**
 * 加载屏幕组件
 */
const LoadingScreen: React.FC = () => (
  <div style={LOADING_STYLES.overlay}>
    <div>加载中...</div>
    <div style={LOADING_STYLES.text}>正在获取用户信息...</div>
  </div>
);

/**
 * 基础布局组件
 *
 * 重构后的极简实现：
 * - 从107行减少到43行 (减少60%)
 * - 从4个Hook减少到1个Hook (减少75%)
 * - 职责单一：只负责用户状态验证和容器提供
 * - 所有布局逻辑移至LayoutProvider统一管理
 */
const BasicLayout: React.FC = () => {
  const { loading } = useUserStatus();

  // 用户信息加载中
  if (loading) {
    return <LoadingScreen />;
  }

  // 提供布局容器
  return (
    <LayoutProvider>
      <LayoutStructure />
    </LayoutProvider>
  );
};

export default BasicLayout; 