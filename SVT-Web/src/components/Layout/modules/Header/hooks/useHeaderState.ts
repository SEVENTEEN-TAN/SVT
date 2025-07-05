import { useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/useAuth';
import type { UserInfo } from '@/components/Layout/shared/types/layout';

interface UseHeaderStateReturn {
  currentPath: string;
  user?: UserInfo | null;
  handleLogout: () => void;
}

// 头部状态管理Hook
export const useHeaderState = (): UseHeaderStateReturn => {
  const location = useLocation();
  const { currentUser: user, logout } = useAuth();

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