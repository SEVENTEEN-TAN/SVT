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

    private final RolePermissionService rolePermissionServiceImpl;
    private final com.seventeen.svt.modules.system.service.UserRoleService userRoleServiceImpl;

    public RoleInfoServiceImpl(RolePermissionService rolePermissionServiceImpl,
                              com.seventeen.svt.modules.system.service.UserRoleService userRoleServiceImpl) {
        this.rolePermissionServiceImpl = rolePermissionServiceImpl;
        this.userRoleServiceImpl = userRoleServiceImpl;
    }

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
        
        // 为每个角色添加用户数量统计
        PageResult<RoleDetailDTO> pageResult = PageResult.from(getRoleListDTOPage);
        if (pageResult.getRecords() != null) {
            for (RoleDetailDTO role : pageResult.getRecords()) {
                List<String> userIds = getRoleUserList(role.getRoleId());
                role.setUserCount(userIds.size());
            }
        }
        return pageResult;
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

        // 检查角色是否被用户使用
        List<String> userList = getRoleUserList(roleId);
        if (!userList.isEmpty()) {
            throw new BusinessException("角色下还有 " + userList.size() + " 个用户，无法删除。请先移除用户关联后再删除角色。");
        }

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
     * @param status 状态（0：启用，1：停用）
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
     * 批量删除角色
     *
     * @param roleIds 角色ID列表
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchDelete(List<String> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            throw new BusinessException("角色ID列表不能为空");
        }

        // 检查是否有角色被用户使用
        for (String roleId : roleIds) {
            List<String> userList = getRoleUserList(roleId);
            if (!userList.isEmpty()) {
                RoleDetailDTO role = getRoleDetail(roleId);
                throw new BusinessException("角色[" + (role != null ? role.getRoleNameZh() : roleId) + "]已被用户使用，无法删除");
            }
        }

        // 批量逻辑删除
        UpdateChain.of(RoleInfo.class)
                .set(RoleInfo::getDelFlag, SystemConstant.DelFlag.DELETED)
                .where(ROLE_INFO.ROLE_ID.in(roleIds))
                .update();
    }

    /**
     * 获取角色关联的用户ID列表
     *
     * @param roleId 角色ID
     * @return 用户ID列表
     */
    @Override
    public List<String> getRoleUserList(String roleId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(com.seventeen.svt.modules.system.entity.table.Tables.USER_ROLE.USER_ID)
                .from(com.seventeen.svt.modules.system.entity.table.Tables.USER_ROLE)
                .where(com.seventeen.svt.modules.system.entity.table.Tables.USER_ROLE.ROLE_ID.eq(roleId)
                        .and(com.seventeen.svt.modules.system.entity.table.Tables.USER_ROLE.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        
        List<com.seventeen.svt.modules.system.entity.UserRole> userRoles = 
            mapper.selectListByQueryAs(queryWrapper, com.seventeen.svt.modules.system.entity.UserRole.class);
        return userRoles.stream()
                .map(com.seventeen.svt.modules.system.entity.UserRole::getUserId)
                .toList();
    }

    /**
     * 获取角色关联的用户详细信息列表
     *
     * @param roleId 角色ID
     * @return 用户详细信息列表
     */
    @Override
    public List<com.seventeen.svt.modules.system.dto.response.UserDetailDTO> getRoleUserDetailList(String roleId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(com.seventeen.svt.modules.system.entity.table.Tables.USER_INFO.ALL_COLUMNS)
                .from(com.seventeen.svt.modules.system.entity.table.Tables.USER_INFO)
                .innerJoin(com.seventeen.svt.modules.system.entity.table.Tables.USER_ROLE)
                .on(com.seventeen.svt.modules.system.entity.table.Tables.USER_INFO.USER_ID.eq(
                    com.seventeen.svt.modules.system.entity.table.Tables.USER_ROLE.USER_ID))
                .where(com.seventeen.svt.modules.system.entity.table.Tables.USER_ROLE.ROLE_ID.eq(roleId)
                        .and(com.seventeen.svt.modules.system.entity.table.Tables.USER_ROLE.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST))
                        .and(com.seventeen.svt.modules.system.entity.table.Tables.USER_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)))
                .orderBy(com.seventeen.svt.modules.system.entity.table.Tables.USER_INFO.CREATE_TIME, false);
        
        return mapper.selectListByQueryAs(queryWrapper, com.seventeen.svt.modules.system.dto.response.UserDetailDTO.class);
    }

    /**
     * 获取角色关联的权限列表
     *
     * @param roleId 角色ID
     * @return 权限详细信息列表
     */
    @Override
    public List<com.seventeen.svt.modules.system.dto.response.PermissionDetailDTO> getRolePermissionList(String roleId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO.ALL_COLUMNS)
                .from(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO)
                .innerJoin(com.seventeen.svt.modules.system.entity.table.Tables.ROLE_PERMISSION)
                .on(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO.PERMISSION_ID.eq(
                    com.seventeen.svt.modules.system.entity.table.Tables.ROLE_PERMISSION.PERMISSION_ID))
                .where(com.seventeen.svt.modules.system.entity.table.Tables.ROLE_PERMISSION.ROLE_ID.eq(roleId)
                        .and(com.seventeen.svt.modules.system.entity.table.Tables.ROLE_PERMISSION.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST))
                        .and(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)))
                .orderBy(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO.PERMISSION_SORT, true);
        
        return mapper.selectListByQueryAs(queryWrapper, com.seventeen.svt.modules.system.dto.response.PermissionDetailDTO.class);
    }

    /**
     * 分配角色权限
     *
     * @param roleId 角色ID
     * @param permissionIds 权限ID列表
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignRolePermissions(String roleId, List<String> permissionIds) {
        // 检查角色是否存在
        RoleInfo existingRole = selectRoleInfoByRoleId(roleId);
        if (existingRole == null) {
            throw new BusinessException("角色不存在");
        }
        rolePermissionServiceImpl.batchInsertRolePermission(permissionIds, roleId);
    }

    /**
     * 获取所有权限列表
     *
     * @return 权限详细信息列表
     */
    @Override
    public List<com.seventeen.svt.modules.system.dto.response.PermissionDetailDTO> getAllPermissions() {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO.ALL_COLUMNS)
                .from(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO)
                .where(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)
                        .and(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .orderBy(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO.PERMISSION_GROUP, true)
                .orderBy(com.seventeen.svt.modules.system.entity.table.Tables.PERMISSION_INFO.PERMISSION_SORT, true);
        
        return mapper.selectListByQueryAs(queryWrapper, com.seventeen.svt.modules.system.dto.response.PermissionDetailDTO.class);
    }

    /**
     * 分配角色用户
     *
     * @param roleId 角色ID
     * @param userIds 用户ID列表
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignRoleUsers(String roleId, List<String> userIds) {
        // 检查角色是否存在
        RoleInfo existingRole = selectRoleInfoByRoleId(roleId);
        if (existingRole == null) {
            throw new BusinessException("角色不存在");
        }

        // 先删除现有的角色用户关联
        userRoleServiceImpl.deleteRoleUsersByRoleId(roleId);

        // 添加新的用户关联
        if (userIds != null && !userIds.isEmpty()) {
            userRoleServiceImpl.addRoleUsers(roleId, userIds);
        }
    }

    /**
     * 验证角色编码唯一性
     *
     * @param roleCode 角色编码
     * @param roleId 角色ID（编辑时排除自身）
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




