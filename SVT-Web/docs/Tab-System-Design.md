# Tab系统设计文档

## 概述

SVT系统采用多Tab页面管理方式，为用户提供类似浏览器的多页面工作体验。用户可以同时打开多个页面，在不同页面间快速切换，提高工作效率。

## 设计原则

### 1. 用户体验优先
- **无强制限制**：不限制Tab数量，让用户自由管理
- **智能刷新**：重复点击菜单时刷新页面内容
- **自然滚动**：Tab过多时支持水平滚动
- **安全操作**：防止误操作，保护重要Tab

### 2. 性能优化
- **按需刷新**：只在必要时刷新页面内容
- **防重复操作**：避免快速连续操作导致的状态冲突
- **内存管理**：合理的组件生命周期管理

### 3. 功能完整性
- **右键菜单**：提供丰富的Tab管理功能
- **状态保持**：Tab切换时保持页面状态
- **路由同步**：Tab状态与浏览器路由保持同步

## 核心功能

### 1. Tab基础操作

#### 1.1 Tab创建
- **菜单点击**：点击左侧菜单自动创建对应Tab
- **路由导航**：通过编程方式导航也会创建Tab
- **重复检测**：避免创建重复的Tab

#### 1.2 Tab切换
- **点击切换**：点击Tab标签切换到对应页面
- **键盘导航**：支持键盘快捷键切换（未来功能）
- **状态同步**：切换时同步更新活跃状态和路由

#### 1.3 Tab关闭
- **单个关闭**：点击Tab上的关闭按钮
- **批量关闭**：通过右键菜单批量关闭
- **智能切换**：关闭当前Tab时自动切换到相邻Tab

### 2. 智能刷新机制

#### 2.1 刷新策略
```typescript
// 重复点击当前菜单时刷新
const handleMenuClick = (menuKey: string) => {
  const isCurrentTab = activeTabKey === menuKey;
  addTab(menuKey, isCurrentTab); // 重复点击时强制刷新
};
```

#### 2.2 刷新实现
- **React Key机制**：通过改变Outlet的key强制重新渲染
- **组件重挂载**：确保页面组件完全重新初始化
- **数据重新获取**：触发useEffect重新执行

### 3. 右键菜单功能

#### 3.1 菜单项列表
1. **刷新** - 重新加载当前页面
2. **关闭当前页面** - 关闭当前Tab（仪表盘不可关闭）
3. **关闭左边** - 关闭当前Tab左边的所有可关闭Tab
4. **关闭右边** - 关闭当前Tab右边的所有可关闭Tab
5. **关闭其他** - 关闭除当前Tab和仪表盘外的所有Tab

#### 3.2 智能禁用
```typescript
const getContextMenuItems = (tabKey: string) => {
  const currentIndex = tabList.findIndex(tab => tab.key === tabKey);
  const hasLeftTabs = currentIndex > 0 && tabList.slice(0, currentIndex).some(tab => tab.closable);
  const hasRightTabs = currentIndex < tabList.length - 1 && tabList.slice(currentIndex + 1).some(tab => tab.closable);
  const hasOtherTabs = tabList.some(tab => tab.closable && tab.key !== tabKey);
  const isClosable = tabList.find(tab => tab.key === tabKey)?.closable;

  return [
    {
      key: 'refresh',
      label: '刷新',
      onClick: () => refreshTab(tabKey),
    },
    {
      key: 'close',
      label: '关闭当前页面',
      disabled: !isClosable,
      onClick: () => closeCurrentTab(tabKey),
    },
    // ... 其他菜单项
  ];
};
```

## 技术实现

### 1. 数据结构

#### 1.1 Tab项定义
```typescript
interface TabItem {
  key: string;        // Tab唯一标识，通常是路由路径
  label: string;      // Tab显示名称
  path: string;       // 对应的路由路径
  closable: boolean;  // 是否可关闭（仪表盘不可关闭）
}
```

#### 1.2 状态管理
```typescript
const [activeTabKey, setActiveTabKey] = useState<string>('/dashboard');
const [tabList, setTabList] = useState<TabItem[]>([
  {
    key: '/dashboard',
    label: '仪表盘',
    path: '/dashboard',
    closable: false,
  },
]);
const [pageRefreshKey, setPageRefreshKey] = useState<number>(0);
```

### 2. 核心函数

#### 2.1 添加Tab
```typescript
const addTab = useCallback((path: string, forceRefresh = false) => {
  const isCurrentTab = activeTabKey === path;
  
  setTabList(prev => {
    const existingTab = prev.find(tab => tab.key === path);
    if (!existingTab) {
      const newTab: TabItem = {
        key: path,
        label: getTabName(path),
        path: path,
        closable: path !== '/dashboard',
      };
      return [...prev, newTab];
    }
    return prev;
  });
  
  setActiveTabKey(path);
  
  if (forceRefresh || isCurrentTab) {
    setPageRefreshKey(prev => prev + 1);
  }
  
  navigate(path);
}, [getTabName, navigate, activeTabKey]);
```

#### 2.2 关闭Tab
```typescript
const removeTab = useCallback((targetKey: string) => {
  if (targetKey === '/dashboard') return;
  
  setTabList(prev => {
    const newTabList = prev.filter(tab => tab.key !== targetKey);
    
    if (activeTabKey === targetKey) {
      const newActiveTab = newTabList[newTabList.length - 1];
      setActiveTabKey(newActiveTab.key);
      navigate(newActiveTab.path);
    }
    
    return newTabList;
  });
}, [activeTabKey, navigate]);
```

### 3. UI组件

#### 3.1 Tab渲染
```typescript
const tabItems = tabList.map(tab => ({
  key: tab.key,
  label: (
    <span 
      onContextMenu={(e) => handleTabContextMenu(e, tab.key)}
    >
      <span>{tab.label}</span>
      {tab.closable && (
        <CloseOutlined onClick={() => removeTab(tab.key)} />
      )}
    </span>
  ),
  closable: false,
}));
```

#### 3.2 Antd Tabs配置
```typescript
<Tabs
  type="card"
  activeKey={activeTabKey}
  onChange={switchTab}
  items={tabItems}
  tabBarGutter={4}
  style={{ 
    margin: '0 16px',
    width: 'calc(100% - 32px)',
  }}
  tabBarStyle={{
    marginBottom: 0,
    height: 34,
    minHeight: 34,
  }}
/>
```

## 性能优化

### 1. 避免不必要的重渲染
- **useCallback**：缓存函数引用
- **useMemo**：缓存计算结果
- **React.memo**：组件级别的优化

### 2. 防重复操作
```typescript
const isOperatingRef = useRef(false);

const removeTab = useCallback((targetKey: string) => {
  if (isOperatingRef.current) return;
  isOperatingRef.current = true;
  
  // 执行关闭逻辑
  
  setTimeout(() => {
    isOperatingRef.current = false;
  }, 0);
}, []);
```

### 3. 智能依赖管理
- 精简useEffect依赖数组
- 使用函数式状态更新避免依赖
- 合理使用useRef避免不必要的重渲染

## 用户体验设计

### 1. 视觉反馈
- **活跃状态**：当前Tab有明显的视觉区分
- **悬停效果**：鼠标悬停时的交互反馈
- **关闭按钮**：清晰的关闭操作入口

### 2. 操作便利性
- **右键菜单**：丰富的批量操作选项
- **智能禁用**：根据实际情况禁用不可用选项
- **快捷操作**：常用操作的快速入口

### 3. 错误预防
- **仪表盘保护**：确保用户始终有可用页面
- **确认机制**：重要操作的二次确认（未来功能）
- **状态恢复**：异常情况下的状态恢复

## 扩展性设计

### 1. 功能扩展
- **Tab拖拽排序**：支持拖拽调整Tab顺序
- **Tab分组**：支持Tab分组管理
- **历史记录**：记录用户的Tab使用历史

### 2. 配置化
- **最大Tab数量**：可配置的Tab数量限制
- **默认行为**：可配置的默认操作行为
- **主题定制**：支持Tab样式的主题定制

### 3. 集成能力
- **状态持久化**：Tab状态的本地存储
- **跨窗口同步**：多窗口间的Tab状态同步
- **API集成**：与后端的Tab状态同步

## 总结

SVT的Tab系统设计充分考虑了用户体验、性能优化和扩展性，提供了完整的多页面管理能力。通过智能的刷新机制、丰富的右键菜单功能和优雅的滚动支持，为用户提供了高效的工作环境。

系统采用React Hooks和函数式编程范式，代码结构清晰，易于维护和扩展。未来可以根据用户反馈和业务需求，继续优化和增强Tab系统的功能。
