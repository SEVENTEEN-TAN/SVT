import React, { useMemo } from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import type { PathMaps } from '../../shared/types/layout';

interface BreadcrumbProps {
  currentPath: string;
  pathMaps: PathMaps;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPath, pathMaps }) => {
  // 生成面包屑项
  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        title: (
          <span>
            <HomeOutlined style={{ marginRight: '4px' }} />
            首页
          </span>
        ),
      },
    ];

    // 如果当前路径有映射，添加到面包屑
    if (pathMaps.breadcrumbMap[currentPath] && currentPath !== '/home') {
      items.push({
        title: <span>{pathMaps.breadcrumbMap[currentPath]}</span>,
      });
    }

    return items;
  }, [currentPath, pathMaps.breadcrumbMap]);

  return <AntBreadcrumb items={breadcrumbItems} />;
};

export default Breadcrumb; 