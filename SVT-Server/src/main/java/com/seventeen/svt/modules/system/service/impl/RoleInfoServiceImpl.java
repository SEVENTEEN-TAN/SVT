package com.seventeen.svt.modules.system.service.impl;

import cn.hutool.core.util.StrUtil;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.common.exception.BusinessException;
import com.seventeen.svt.common.page.PageQuery;
import com.seventeen.svt.common.page.PageResult;
import com.seventeen.svt.modules.system.dto.request.InsertOrUpdateRoleDetailDTO;
import com.seventeen.svt.modules.system.dto.request.RoleConditionDTO;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.entity.RoleInfo;
import com.seventeen.svt.modules.system.mapper.RoleInfoMapper;
import com.seventeen.svt.modules.system.service.RoleInfoService;
import com.seventeen.svt.modules.system.service.RolePermissionService;
import com.seventeen.svt.modules.system.service.UserOrgRoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .where(ROLE_INFO.ROLE_ID.eq(roleId).and(ROLE_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        return mapper.selectOneByQuery(sqlWrapper);
    }

    /**
     * 根据角色ID列表获取角色信息列表
     *
     * @param roleIds 角色ID列表
     * @return 角色信息列表
     */
    @Override
    public List<RoleInfo> selectRoleInfoByRoleIds(List<String> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return new java.util.ArrayList<>();
        }
        QueryWrapper sqlWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(ROLE_INFO)
                .where(ROLE_INFO.ROLE_ID.in(roleIds).and(ROLE_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        return mapper.selectListByQuery(sqlWrapper);
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
    @Transactional(rollbackFor = Exception.class)
    public void insertOrUpdateRole(InsertOrUpdateRoleDetailDTO editRoleDetailDTO) {
        String roleId = editRoleDetailDTO.getRoleId();

        // 验证角色编码唯一性
        validateRoleCode(editRoleDetailDTO.getRoleCode(), roleId);

        //如果存在则更新，否则插入
        if (StrUtil.isNotEmpty(roleId)) {
            // 检查角色是否存在
            RoleInfo existingRole = selectRoleInfoByRoleId(roleId);
            if (existingRole == null) {
                throw new BusinessException("角色不存在");
            }

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
     * 更新角色状态
     *
     * @param roleId 角色ID
     * @param status 状态（0：启用，1：停用）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateRoleStatus(String roleId, String status) {
        // 检查角色是否存在
        RoleInfo existingRole = selectRoleInfoByRoleId(roleId);
        if (existingRole == null) {
            throw new BusinessException("角色不存在");
        }

        UpdateChain.of(RoleInfo.class)
                .set(RoleInfo::getStatus, status)
                .where(RoleInfo::getRoleId).eq(roleId)
                .update();
    }

    /**
     * 删除角色
     *
     * @param roleId 角色ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRole(String roleId) {
        // 检查角色是否存在
        RoleInfo existingRole = selectRoleInfoByRoleId(roleId);
        if (existingRole == null) {
            throw new BusinessException("角色不存在");
        }

        // TODO: 检查角色是否被用户使用
//        List<String> userList = getRoleUserList(roleId);
//        if (!userList.isEmpty()) {
//            throw new BusinessException("角色下还有 " + userList.size() + " 个用户，无法删除。请先移除用户关联后再删除角色。");
//        }

        // 逻辑删除
        UpdateChain.of(RoleInfo.class)
                .set(RoleInfo::getDelFlag, SystemConstant.DelFlag.DELETED)
                .where(RoleInfo::getRoleId).eq(roleId)
                .update();
    }

    /**
     * 批量更新角色状态
     *
     * @param roleIds 角色ID列表
     * @param status  状态（0：启用，1：停用）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchUpdateStatus(List<String> roleIds, String status) {
        if (roleIds == null || roleIds.isEmpty()) {
            throw new BusinessException("角色ID列表不能为空");
        }

        UpdateChain.of(RoleInfo.class)
                .set(RoleInfo::getStatus, status)
                .where(ROLE_INFO.ROLE_ID.in(roleIds))
                .update();
    }


    /**
     * 验证角色编码唯一性
     *
     * @param roleCode 角色编码
     * @param roleId   角色ID（编辑时排除自身）
     */
    private void validateRoleCode(String roleCode, String roleId) {
        if (StrUtil.isBlank(roleCode)) {
            throw new BusinessException("角色编码不能为空");
        }

        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ROLE_ID)
                .from(ROLE_INFO)
                .where(ROLE_INFO.ROLE_CODE.eq(roleCode)
                        .and(ROLE_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST))
                        .and(ROLE_INFO.ROLE_ID.ne(roleId, StrUtil.isNotEmpty(roleId))));

        RoleInfo existingRole = mapper.selectOneByQuery(queryWrapper);
        if (existingRole != null) {
            throw new BusinessException("角色编码已存在");
        }
    }
}




