import { useRef, useMemo, useState, useEffect } from 'react';

export function useTableScroll(scrollX: number = 702) {
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
  
  // 监听容器尺寸变化
  useEffect(() => {
    const element = tableWrapperRef.current;
    if (!element) return;
    
    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect();
      setContainerSize({ width, height });
    };
    
    // 初始计算
    updateSize();
    
    // 使用 ResizeObserver 监听尺寸变化
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);
    
    // 监听窗口大小变化
    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      resizeObserver.unobserve(element);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  function getTableScrollY() {
    const height = containerSize?.height;

    if (!height) return undefined;

    // 预留空间：Card头部(64px) + 独立分页器(72px) + 内边距和间距(32px)
    const RESERVED_HEIGHT = 168;
    const availableHeight = height - RESERVED_HEIGHT;

    // 确保至少有200px的表格显示高度
    return availableHeight > 200 ? availableHeight : 200;
  }

  const scrollConfig = useMemo(() => ({
    x: scrollX,
    y: getTableScrollY()
  }), [scrollX, containerSize?.height]);

  return {
    scrollConfig,
    tableWrapperRef
  };
}