package com.seventeen.svt.common.util;

import com.seventeen.svt.frame.cache.util.CodeLibraryCacheUtils;
import com.seventeen.svt.modules.system.entity.MenuInfo;
import lombok.Data;
import org.springframework.beans.BeanUtils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class TreeUtils {

    /**
     * 构建菜单树
     *
     * @param menuList 菜单列表
     * @param parentId 父节点ID,顶层节点的parentId为null
     * @return 树形菜单列表
     */
    public static List<MenuTreeVO> buildMenuTree(List<MenuInfo> menuList, String parentId) {

        // 转换成VO
        List<MenuTreeVO> menuVOList = menuList.stream()
                .map(s -> {
                    //将MenuInfo转换为MenuTreeVO
                    MenuTreeVO vo = new MenuTreeVO();
                    BeanUtils.copyProperties(s, vo);
                    vo.setChildren(new ArrayList<>());
                    return vo;
                })
                .toList();


        return menuVOList.stream()
                .filter(menu -> Objects.equals(menu.getParentId(), parentId))
                .peek(menu -> menu.setChildren(buildMenuTree(menuList, menu.getMenuId())))
                .sorted(Comparator.comparing(MenuTreeVO::getMenuSort))
                .collect(Collectors.toList());
    }


    @Data
    public static class MenuTreeVO implements Serializable {

        private static final long serialVersionUID = 1L;
        /**
         * 菜单ID
         */
        private String menuId;

        /**
         * 父菜单ID
         */
        private String parentId;

        /**
         * 菜单中文名称
         */
        private String menuNameZh;

        /**
         * 菜单英文名称
         */
        private String menuNameEn;

        /**
         * 菜单路径
         */
        private String menuPath;

        /**
         * 菜单图标
         */
        private String menuIcon;

        /**
         * 显示顺序
         */
        private Integer menuSort;

        /**
         * 状态（0：正常，1：停用）
         * 使用@JsonIgnore避免字段直接序列化，只通过getter方法序列化
         */
        private String status;

        /**
         * 描述
         */
        private String remark;

        /**
         * 子菜单列表
         */
        private List<MenuTreeVO> children;
    }
}
