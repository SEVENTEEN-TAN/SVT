import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserInfo, PathMaps } from '../../../shared/types/layout';

interface UseHeaderStateReturn {
  currentPath: string;
  user?: UserInfo | null;
  handleLogout: () => void;
}

// 头部状态管理Hook
export const useHeaderState = (pathMaps: PathMaps): UseHeaderStateReturn => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
  };

  return {
    currentPath,
    user: user as UserInfo | null,
    handleLogout,
  };
}; 