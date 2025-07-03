/*
 * 动态计算 Ant Design Table scroll.y 的 Hook
 * 根据容器高度－顶部可变区域高度－预留固定高度，实时返回可滚动高度
 * 支持窗口 resize 与元素 ResizeObserver
 */
import { useState, useRef, useEffect } from 'react';

export interface TableScrollYHook {
  containerRef: React.RefObject<HTMLDivElement | null>;
  topRef: React.RefObject<HTMLDivElement | null>;
  scrollY: number;
}

/**
 * @param reserve 预留固定高度（分页器、卡片内边距等），默认 200px
 */
const useTableScrollY = (reserve: number = 200): TableScrollYHook => {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState<number>(0);

  const calc = () => {
    const containerH = containerRef.current?.clientHeight ?? 0;
    const topH = topRef.current?.clientHeight ?? 0;
    const computed = containerH - topH - reserve;
    setScrollY(computed > 120 ? computed : 120); // 至少留 120px 显示
  };

  useEffect(() => {
    calc(); // 初始计算

    // 等下一帧再计算一次，确保所有布局完成
    requestAnimationFrame(calc);

    // 再延时 400ms 保险重算一次，处理字体加载/异步渲染
    const timeoutId = window.setTimeout(calc, 400);

    // window resize 监听
    const onResize = () => calc();
    window.addEventListener('resize', onResize);

    // 元素尺寸监听（容器 & 顶部区域）
    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);
    if (topRef.current) ro.observe(topRef.current);

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return { containerRef, topRef, scrollY };
};

export default useTableScrollY; 