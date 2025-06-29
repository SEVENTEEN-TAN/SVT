package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.dto.response.GetRoleListDTO;
import com.seventeen.svt.modules.system.entity.RoleInfo;
import com.seventeen.svt.modules.system.mapper.RoleInfoMapper;
import com.seventeen.svt.modules.system.service.RoleInfoService;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.ROLE_INFO;

/**
* 针对表【role_info(角色表)】的数据库操作Service实现
*/
@Service
public class RoleInfoServiceImpl extends ServiceImpl<RoleInfoMapper, RoleInfo>
    implements RoleInfoService{

    /**
     * 根据角色ID获取角色详情
     * @param roleId 角色ID
     * @return 角色详情
     */
    @Override
    public RoleInfo selectRoleInfoByRoleId(String roleId) {
        QueryWrapper sqlWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(ROLE_INFO)
                .where(ROLE_INFO.ROLE_ID.eq(roleId).and(ROLE_INFO.STATUS.eq(SystemConstant.Status.NORMAL)));
        return mapper.selectOneByQuery(sqlWrapper);
    }

    /**
     * 获取角色列表
     * @return List<GetRoleListDTO> 角色列表
     */
    @Override
    public List<GetRoleListDTO> getRoleList() {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(ROLE_INFO)
                .where(ROLE_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST))
                .orderBy(ROLE_INFO.ROLE_SORT, true);
        return mapper.selectListByQueryAs(queryWrapper, GetRoleListDTO.class);
    }

    /**
     * 获取所有启用的角色列表
     * @return List<GetRoleListDTO> 角色列表
     */
    @Override
    public List<GetRoleListDTO> getActiveRoleList() {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(ROLE_INFO)
                .where(ROLE_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)
                        .and(ROLE_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .orderBy(ROLE_INFO.ROLE_SORT, true);
        return mapper.selectListByQueryAs(queryWrapper, GetRoleListDTO.class);
    }
}




