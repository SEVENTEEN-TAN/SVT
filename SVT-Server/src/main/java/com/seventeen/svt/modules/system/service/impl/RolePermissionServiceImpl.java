package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.entity.PermissionInfo;
import com.seventeen.svt.modules.system.entity.RolePermission;
import com.seventeen.svt.modules.system.mapper.RolePermissionMapper;
import com.seventeen.svt.modules.system.service.RolePermissionService;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO;
import static com.seventeen.svt.modules.system.entity.table.Tables.ROLE_PERMISSION;

/**
 * 针对表【role_permission(角色权限关联表)】的数据库操作Service实现
 */
@Service
public class RolePermissionServiceImpl extends ServiceImpl<RolePermissionMapper, RolePermission>
        implements RolePermissionService {

    @Override
    public List<PermissionInfo> selectPermissionListByRoleId(String roleId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(PERMISSION_INFO.ALL_COLUMNS)
                .from(ROLE_PERMISSION.as("rp"))
                .leftJoin(PERMISSION_INFO).as("pi")
                    .on(PERMISSION_INFO.PERMISSION_ID.eq(ROLE_PERMISSION.PERMISSION_ID)
                            .and(PERMISSION_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .where(ROLE_PERMISSION.ROLE_ID.eq(roleId))
                .orderBy(PERMISSION_INFO.PERMISSION_SORT, true);
        return mapper.selectListByQueryAs(queryWrapper,PermissionInfo.class);
    }

    @Override
    public void batchInsertRolePermission(List<String> permissionIds, String roleId) {
        // 先删除现有的角色权限关联
        UpdateChain.of(RolePermission.class)
                .set(RolePermission::getDelFlag, SystemConstant.DelFlag.DELETED)
                .where(ROLE_PERMISSION.ROLE_ID.eq(roleId))
                .update();

        // 添加新的权限关联
        if (permissionIds != null && !permissionIds.isEmpty()) {
            for (String permissionId : permissionIds) {
                com.seventeen.svt.modules.system.entity.RolePermission rolePermission =
                        new com.seventeen.svt.modules.system.entity.RolePermission();
                rolePermission.setRoleId(roleId);
                rolePermission.setPermissionId(permissionId);
                mapper.insertSelective(rolePermission);
            }
        }
    }

}




