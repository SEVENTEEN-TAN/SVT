/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export interface BackendMenuData {
  menuId?: string;
  parentId?: string;
  menuNameZh?: string;
  menuNameEn?: string;
  menuPath?: string;
  menuIcon?: string;
  menuSort?: string;
  status?: string;
  remark?: string;
}

export interface MenuNode {
  menuId: string;
  parentId: string | null;
  menuNameZh: string;
  menuNameEn?: string;
  menuPath: string;
  menuIcon?: string;
  menuSort: number;
  status: '0' | '1';
  remark?: string;
  seq?: string;
  children?: MenuNode[];
}

export interface FlatNode extends Omit<MenuNode, 'children'> {
  level: number;
}

export function transformBackendToFrontend(backendData: BackendMenuData): MenuNode {
  return {
    menuId: backendData.menuId || '',
    parentId: backendData.parentId || null,
    menuNameZh: backendData.menuNameZh || '',
    menuNameEn: backendData.menuNameEn,
    menuPath: backendData.menuPath || '',
    menuIcon: backendData.menuIcon,
    menuSort: parseInt(backendData.menuSort || '0', 10),
    status: (backendData.status as '0' | '1') || '0',
    remark: backendData.remark,
  };
}

export function transformFrontendToBackend(frontendData: MenuNode): BackendMenuData {
  return {
    menuId: frontendData.menuId,
    parentId: frontendData.parentId ?? undefined,
    menuNameZh: frontendData.menuNameZh,
    menuNameEn: frontendData.menuNameEn,
    menuPath: frontendData.menuPath,
    menuIcon: frontendData.menuIcon,
    menuSort: frontendData.menuSort.toString(),
    status: frontendData.status,
    remark: frontendData.remark,
  };
}

export function transformBackendTreeToFrontend(backendTree: any[]): MenuNode[] {
  if (!Array.isArray(backendTree)) return [];
  return backendTree.map(item => {
    const node = transformBackendToFrontend(item);
    if (Array.isArray(item.children) && item.children.length > 0) {
      const children = transformBackendTreeToFrontend(item.children);
      if (children.length) node.children = children;
    }
    return node;
  });
}

export function transformFrontendTreeToBackend(frontendTree: MenuNode[]): BackendMenuData[] {
  return frontendTree.map(item => {
    const backend = transformFrontendToBackend(item);
    if (item.children && item.children.length) {
      (backend as any).children = transformFrontendTreeToBackend(item.children);
    }
    return backend;
  });
}

export function treeToFlat(nodes: MenuNode[], level = 0): FlatNode[] {
  const res: FlatNode[] = [];
  nodes.sort((a, b) => a.menuSort - b.menuSort).forEach(n => {
    const { children, ...rest } = n;
    res.push({ ...rest, level });
    if (children?.length) res.push(...treeToFlat(children, level + 1));
  });
  return res;
}

export function flatToTree(flat: FlatNode[]): MenuNode[] {
  const map = new Map<string, MenuNode>();
  const roots: MenuNode[] = [];
  flat.forEach(f => map.set(f.menuId, { ...f, children: [] }));
  flat.forEach(f => {
    const node = map.get(f.menuId)!;
    if (f.parentId) {
      const parent = map.get(f.parentId);
      parent?.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function assignSeq(nodes: MenuNode[], parentSeq = 'S'): MenuNode[] {
  return nodes.sort((a, b) => a.menuSort - b.menuSort).map((n, idx) => {
    const seq = parentSeq === 'S' ? `S${String(idx + 1).padStart(2, '0')}` : `${parentSeq}${String(idx + 1).padStart(3, '0')}`;
    return { ...n, seq, children: n.children ? assignSeq(n.children, seq) : undefined };
  });
}

export function subtreeEndIndex(flat: FlatNode[], start: number): number {
  const base = flat[start].level;
  let end = start;
  while (end + 1 < flat.length && flat[end + 1].level > base) end += 1;
  return end;
}

export function validateMenuData(menuData: Partial<MenuNode>) {
  const errors: string[] = [];
  if (!menuData.menuNameZh?.trim()) errors.push('菜单中文名称不能为空');
  if (!menuData.menuPath?.trim()) errors.push('菜单路径不能为空');
  if (menuData.menuSort === undefined || menuData.menuSort < 0) errors.push('显示排序必须为非负数');
  if (!menuData.status || !['0', '1'].includes(menuData.status)) errors.push('菜单状态必须为启用或停用');
  return { valid: errors.length === 0, errors };
} 