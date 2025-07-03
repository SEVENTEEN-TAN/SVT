import { useEffect, useState } from 'react';

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // 初始检测
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640); // sm 断点
    };
    
    checkMobile();
    
    // 监听窗口大小变化
    const handleResize = debounce(checkMobile, 150);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return isMobile;
}