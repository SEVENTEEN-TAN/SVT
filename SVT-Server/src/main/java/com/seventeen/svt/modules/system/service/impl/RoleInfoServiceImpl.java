package com.seventeen.svt.modules.system.service.impl;

import cn.hutool.core.util.StrUtil;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.common.page.PageQuery;
import com.seventeen.svt.common.page.PageResult;
import com.seventeen.svt.modules.system.dto.request.InsertOrUpdateRoleDetailDTO;
import com.seventeen.svt.modules.system.dto.request.RoleConditionDTO;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.dto.response.UserDetailDTO;
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
        implements RoleInfoService {

    /**
     * 根据角色ID获取角色详情
     *
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
     *
     * @return List<GetRoleListDTO> 角色列表
     */
    @Override
    public PageResult<RoleDetailDTO> getRoleList(PageQuery<RoleConditionDTO> getRoleListConditionDTO) {
        RoleConditionDTO condition = getRoleListConditionDTO.getCondition();

        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(ROLE_INFO)
                .where(ROLE_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)
                        .and(ROLE_INFO.STATUS.eq(condition.getStatus(), StrUtil.isNotBlank(condition.getStatus())))
                        .and(ROLE_INFO.ROLE_CODE.eq(condition.getRoleCode(), StrUtil.isNotBlank(condition.getRoleCode())))
                        .and(ROLE_INFO.ROLE_NAME_ZH.like(condition.getRoleNameZh(), StrUtil.isNotBlank(condition.getRoleNameZh())))
                        .and(ROLE_INFO.ROLE_NAME_EN.like(condition.getRoleNameEn(), StrUtil.isNotBlank(condition.getRoleNameEn())))
                )
                .orderBy(ROLE_INFO.ROLE_SORT, true);
        Page<RoleDetailDTO> getRoleListDTOPage = mapper.paginateAs(getRoleListConditionDTO.getPageNumber(), getRoleListConditionDTO.getPageSize(), queryWrapper, RoleDetailDTO.class);
        return PageResult.from(getRoleListDTOPage);
    }

    /**
     * 获取所有启用的角色列表
     *
     * @return List<GetRoleListDTO> 角色列表
     */
    @Override
    public List<RoleDetailDTO> getActiveRoleList() {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(ROLE_INFO)
                .where(ROLE_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)
                        .and(ROLE_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .orderBy(ROLE_INFO.ROLE_SORT, true);
        return mapper.selectListByQueryAs(queryWrapper, RoleDetailDTO.class);
    }

    /**
     * 获取角色详情
     *
     * @param roleId 角色ID
     * @return 角色详情
     */
    @Override
    public RoleDetailDTO getRoleDetail(String roleId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(ROLE_INFO)
                .where(ROLE_INFO.ROLE_ID.eq(roleId)
                        .and(ROLE_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        return mapper.selectOneByQueryAs(queryWrapper, RoleDetailDTO.class);
    }

    /**
     * 新增/编辑角色
     *
     * @param editRoleDetailDTO 编辑角色DTO
     */
    @Override
    public void insertOrUpdateRole(InsertOrUpdateRoleDetailDTO editRoleDetailDTO) {
        String roleId = editRoleDetailDTO.getRoleId();

        //如果存在则更新，否则插入
        if (StrUtil.isNotEmpty(roleId)) {
            UpdateChain.of(RoleInfo.class)
                    .set(RoleInfo::getRoleCode, editRoleDetailDTO.getRoleCode())
                    .set(RoleInfo::getRoleNameZh, editRoleDetailDTO.getRoleNameZh())
                    .set(RoleInfo::getRoleNameEn, editRoleDetailDTO.getRoleNameEn())
                    .set(RoleInfo::getRoleSort, editRoleDetailDTO.getRoleSort())
                    .set(RoleInfo::getRemark, editRoleDetailDTO.getRemark())
                    .set(RoleInfo::getStatus, editRoleDetailDTO.getStatus())
                    .where(RoleInfo::getRoleId).eq(roleId)
                    .update();
        } else {
            RoleInfo roleInfo = new RoleInfo();
            roleInfo.setRoleCode(editRoleDetailDTO.getRoleCode());
            roleInfo.setRoleNameZh(editRoleDetailDTO.getRoleNameZh());
            roleInfo.setRoleNameEn(editRoleDetailDTO.getRoleNameEn());
            roleInfo.setRoleSort(editRoleDetailDTO.getRoleSort());
            roleInfo.setRemark(editRoleDetailDTO.getRemark());
            roleInfo.setStatus(editRoleDetailDTO.getStatus());
            mapper.insertSelective(roleInfo);
        }
    }

    /**
     * 获取角色用户列表
     *
     * @param roleId 角色ID
     * @return 角色用户列表
     */
    @Override
    public List<UserDetailDTO> getRoleUserList(String roleId) {
        //获取当前角色下的所有用户

        return List.of();
    }
}




