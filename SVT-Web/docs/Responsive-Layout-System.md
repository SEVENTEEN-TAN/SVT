# 响应式布局系统设计文档

## 概述

响应式布局系统是SVT前端架构的核心基础设施，提供了三种标准化页面容器类型，实现了完全响应式的用户界面设计。

## 设计理念

### 移动优先 (Mobile First)
- **核心思想**: 从最小屏幕开始设计，逐步增强到大屏幕
- **渐进增强**: 基础功能在所有设备上可用，高级功能在大屏设备上增强
- **性能优先**: 优先保证小屏设备的性能和体验

### 统一容器规范
- **标准化**: 三种容器类型覆盖所有页面场景
- **一致性**: 统一的间距、字体、颜色规范
- **可扩展**: 容器系统支持自定义扩展

## 三种容器类型

### 1. 内容容器 (.page-container-content)

#### 设计目标
适用于内容展示页面，如仪表盘、详情页等，内容可以自然扩展。

#### CSS实现
```css
.page-container-content {
  width: 100%;
  min-height: 100%;
  background: transparent;
  padding: 1.5%;
  box-sizing: border-box;
}
```

#### 特性
- **自适应高度**: 内容不足时保持最小高度，内容多时自然扩展
- **响应式内边距**: 使用百分比padding，不同屏幕自动调整
- **透明背景**: 继承父容器背景，保持视觉一致性

#### 适用场景
- 仪表盘页面
- 内容展示页面
- 详情查看页面
- 统计报表页面

### 2. 居中容器 (.page-container-center)

#### 设计目标
适用于需要完美居中显示的页面，如404页面、占位页面等。

#### CSS实现
```css
.page-container-center {
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow: hidden;
  box-sizing: border-box;
  flex: 1;
}
```

#### 特性
- **完美居中**: 水平和垂直方向完美居中
- **固定高度**: 占满父容器高度，不随内容变化
- **Flex布局**: 使用现代CSS Flex布局实现
- **溢出隐藏**: 防止内容溢出影响布局

#### 适用场景
- 404错误页面
- 加载占位页面
- 登录页面
- 空状态页面

### 3. 管理容器 (.page-container-management)

#### 设计目标
适用于数据管理页面，实现A4纸张效果的内部滚动，表格内容超出时滚动。

#### CSS实现
```css
.page-container-management {
  height: 100%;
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  padding: 2%;
  box-sizing: border-box;
}
```

#### 特性
- **固定高度**: 容器高度固定，内容超出时内部滚动
- **Flex列布局**: 垂直方向弹性布局，适应不同内容区域
- **A4效果**: 类似纸张的固定区域显示效果
- **白色背景**: 提供清晰的内容背景

#### 适用场景
- 表格管理页面
- 数据列表页面
- 表单编辑页面
- 系统管理页面

## 响应式断点设计

### 断点定义
```css
/* 超大屏幕 - 1920px以上 */
@media (min-width: 1920px) {
  .page-container-management { padding: 2.5%; }
}

/* 大屏幕 - 1200px到1920px */
@media (min-width: 1200px) and (max-width: 1919px) {
  .page-container-management { padding: 2%; }
}

/* 中等屏幕 - 768px到1199px (平板设备) */
@media (min-width: 768px) and (max-width: 1199px) {
  .page-container-management { 
    padding: 1.5%; 
  }
  
  .page-toolbar { 
    flex-direction: column; 
    gap: 1%;
  }
}

/* 小屏幕 - 480px到767px (大手机) */
@media (min-width: 480px) and (max-width: 767px) {
  .page-container-management { 
    padding: 1.2%; 
  }
  
  .page-header { 
    margin-bottom: 1.5%; 
  }
  
  .page-toolbar {
    flex-direction: column;
    gap: 1.2%;
  }
}

/* 超小屏幕 - 480px以下 (小手机) */
@media (max-width: 479px) {
  .page-container-management { 
    padding: 1%; 
  }
  
  .page-header h1 { 
    font-size: 1.125rem; 
  }
  
  .page-toolbar {
    flex-direction: column;
    gap: 1.5%;
  }
  
  .ant-table {
    font-size: 0.875rem;
  }
}
```

### 响应式策略

#### 1. 流体网格系统
- **百分比布局**: 所有宽度使用百分比或相对单位
- **弹性间距**: padding、margin使用百分比或em单位
- **自适应字体**: 使用rem和em实现字体缩放

#### 2. 弹性图片和媒体
```css
.responsive-image {
  max-width: 100%;
  height: auto;
  display: block;
}

.responsive-video {
  width: 100%;
  height: auto;
}
```

#### 3. 触摸友好设计
```css
/* 移动设备触摸目标最小尺寸 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 8px;
}

/* 移动设备滚动优化 */
.scrollable-area {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}
```

## 组件适配规范

### 页面头部组件
```css
.page-header {
  margin-bottom: 2%;
  padding-bottom: 1%;
  border-bottom: 1px solid #f0f0f0;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #262626;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.125rem;
  }
}
```

### 工具栏组件
```css
.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2%;
  gap: 1%;
}

.page-toolbar-left {
  display: flex;
  align-items: center;
  gap: 1%;
}

.page-toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.8%;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .page-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1.2%;
  }
  
  .page-toolbar-left,
  .page-toolbar-right {
    justify-content: center;
  }
}
```

### 内容区域组件
```css
.page-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-content-scrollable {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5%;
}

/* 自定义滚动条 */
.page-content-scrollable::-webkit-scrollbar {
  width: 6px;
}

.page-content-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.page-content-scrollable::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.page-content-scrollable::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
```

## 性能优化

### CSS优化策略

#### 1. 关键CSS内联
```html
<!-- 关键样式内联到HTML头部 -->
<style>
  .page-container-content,
  .page-container-center,
  .page-container-management {
    /* 关键样式 */
  }
</style>
```

#### 2. CSS压缩和合并
```javascript
// vite.config.ts 中的CSS优化配置
export default {
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          // Ant Design主题变量
        },
        javascriptEnabled: true,
      },
    },
    postcss: {
      plugins: [
        autoprefixer(),
        cssnano(),
      ],
    },
  },
};
```

#### 3. 避免重排和重绘
```css
/* 使用transform代替改变位置 */
.animated-element {
  transform: translateX(100px);
  transition: transform 0.3s ease;
}

/* 使用opacity代替visibility */
.fade-element {
  opacity: 0;
  transition: opacity 0.3s ease;
}
```

### 渲染性能优化

#### 1. 虚拟滚动
```typescript
// 大数据列表使用虚拟滚动
import { FixedSizeList as List } from 'react-window';

const VirtualizedList: React.FC = () => {
  return (
    <List
      height={600}
      itemCount={1000}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          Item {index}
        </div>
      )}
    </List>
  );
};
```

#### 2. 图片懒加载
```typescript
// 图片懒加载组件
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isLoaded ? src : undefined}
      alt={alt}
      className="responsive-image"
    />
  );
};
```

## 主题系统

### CSS变量定义
```css
:root {
  /* 颜色系统 */
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;
  
  /* 中性色 */
  --text-color: #262626;
  --text-color-secondary: #8c8c8c;
  --background-color: #ffffff;
  --border-color: #f0f0f0;
  
  /* 间距系统 */
  --spacing-xs: 0.5%;
  --spacing-sm: 1%;
  --spacing-md: 1.5%;
  --spacing-lg: 2%;
  --spacing-xl: 2.5%;
  
  /* 字体系统 */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-xxl: 1.5rem;
  
  /* 圆角系统 */
  --border-radius-sm: 2px;
  --border-radius-base: 4px;
  --border-radius-lg: 6px;
  
  /* 阴影系统 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### 暗色主题支持
```css
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: #ffffff;
    --text-color-secondary: #a6a6a6;
    --background-color: #141414;
    --border-color: #303030;
  }
}

[data-theme='dark'] {
  --text-color: #ffffff;
  --text-color-secondary: #a6a6a6;
  --background-color: #141414;
  --border-color: #303030;
}
```

## 可访问性 (Accessibility)

### 语义化HTML
```html
<!-- 正确的语义化结构 -->
<main className="page-container-management">
  <header className="page-header">
    <h1>页面标题</h1>
  </header>
  
  <nav className="page-toolbar" aria-label="页面操作">
    <!-- 工具栏内容 -->
  </nav>
  
  <section className="page-content" aria-label="主要内容">
    <!-- 页面内容 -->
  </section>
</main>
```

### 键盘导航支持
```css
/* 焦点可见性 */
.focusable:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-color);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}
```

### ARIA标签支持
```typescript
// 可访问性增强组件
const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}> = ({ children, onClick, ariaLabel, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      disabled={disabled}
      className="accessible-button"
    >
      {children}
    </button>
  );
};
```

## 测试策略

### 响应式测试
```typescript
// 响应式测试用例
describe('Responsive Layout', () => {
  const viewports = [
    { width: 320, height: 568 },   // iPhone SE
    { width: 768, height: 1024 },  // iPad
    { width: 1024, height: 768 },  // iPad横屏
    { width: 1440, height: 900 },  // 笔记本
    { width: 1920, height: 1080 }, // 桌面
  ];

  viewports.forEach(viewport => {
    it(`should render correctly at ${viewport.width}x${viewport.height}`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/dashboard');
      cy.get('.page-container-content').should('be.visible');
      cy.matchImageSnapshot(`dashboard-${viewport.width}x${viewport.height}`);
    });
  });
});
```

### 性能测试
```typescript
// 性能测试
describe('Layout Performance', () => {
  it('should render within performance budget', () => {
    cy.visit('/dashboard');
    
    // 检查首次内容绘制时间
    cy.window().then((win) => {
      const fcp = win.performance.getEntriesByName('first-contentful-paint')[0];
      expect(fcp.startTime).to.be.lessThan(1500); // 1.5秒内
    });
    
    // 检查布局稳定性
    cy.get('.page-container-content').should('not.have.class', 'layout-shift');
  });
});
```

## 最佳实践

### 1. 设计规范
- **统一间距**: 使用预定义的间距变量
- **一致性**: 相同类型的元素使用相同的样式
- **层次清晰**: 通过字体大小、颜色、间距建立视觉层次

### 2. 性能考虑
- **避免深层嵌套**: CSS选择器嵌套不超过3层
- **合理使用Flex**: 避免不必要的Flex布局嵌套
- **优化重排**: 避免频繁改变布局属性

### 3. 维护性
- **组件化**: 将通用样式抽象为组件
- **文档化**: 为每个容器类型编写使用文档
- **版本控制**: 样式变更要有版本记录

## 故障排除

### 常见问题

#### 1. 容器高度问题
**现象**: 容器高度不正确
**解决方案**:
```css
/* 确保父容器有明确高度 */
.parent-container {
  height: 100vh; /* 或其他明确值 */
}

/* 使用flex布局自动分配高度 */
.flex-parent {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex-child {
  flex: 1; /* 自动占满剩余空间 */
}
```

#### 2. 滚动条问题
**现象**: 出现不期望的滚动条
**解决方案**:
```css
/* 检查overflow设置 */
.container {
  overflow: hidden; /* 或 auto */
}

/* 检查子元素是否超出 */
.child {
  max-width: 100%;
  word-wrap: break-word;
}
```

#### 3. 响应式断点失效
**现象**: 媒体查询不生效
**解决方案**:
```html
<!-- 确保有viewport meta标签 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

```css
/* 检查媒体查询语法 */
@media (max-width: 768px) {
  /* 样式 */
}
```

## 版本历史

- **v1.0.0** (2025-06-22): 初始版本，三种基础容器类型
- **v1.1.0** (计划): 增加更多响应式组件
- **v1.2.0** (计划): 暗色主题完整支持

---

**文档维护**: 前端架构团队  
**最后更新**: 2025-06-22  
**版本**: v1.0.0 