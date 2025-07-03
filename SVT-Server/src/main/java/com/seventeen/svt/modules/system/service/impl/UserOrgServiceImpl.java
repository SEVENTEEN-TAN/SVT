package com.seventeen.svt.modules.system.service.impl;

import cn.hutool.core.util.StrUtil;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.dto.response.OrgDetailDTO;
import com.seventeen.svt.modules.system.entity.UserOrg;
import com.seventeen.svt.modules.system.mapper.UserOrgMapper;
import com.seventeen.svt.modules.system.service.UserOrgService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.ORG_INFO;
import static com.seventeen.svt.modules.system.entity.table.Tables.USER_ORG;

/**
 * 针对表【user_org(用户机构关联表)】的数据库操作Service实现
 */
@Service
public class UserOrgServiceImpl extends ServiceImpl<UserOrgMapper, UserOrg>
        implements UserOrgService {

    @Override
    public List<OrgDetailDTO> getUserOrgListByUserId(String userId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ORG_INFO.ALL_COLUMNS)
                .from(USER_ORG).as("uo")
                .leftJoin(ORG_INFO).as("oi")
                .on(ORG_INFO.ORG_ID.eq(USER_ORG.ORG_ID)
                        .and(ORG_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .where(USER_ORG.USER_ID.eq(userId)
                        .and(USER_ORG.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)))
                .orderBy(ORG_INFO.ORG_SORT, true);
        return mapper.selectListByQueryAs(queryWrapper, OrgDetailDTO.class);
    }

    /**
     * 根据用户ID查询用户机构ID列表
     *
     * @param userId 用户ID
     * @return 机构ID列表
     */
    @Override
    public List<String> getUserOrgIdsByUserId(String userId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(USER_ORG.ORG_ID)
                .from(USER_ORG)
                .where(USER_ORG.USER_ID.eq(userId)
                        .and(USER_ORG.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        
        List<UserOrg> userOrgs = mapper.selectListByQuery(queryWrapper);
        return userOrgs.stream().map(UserOrg::getOrgId).toList();
    }

    /**
     * 删除用户的所有机构关联
     *
     * @param userId 用户ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUserOrgsByUserId(String userId) {
        UpdateChain.of(UserOrg.class)
                .set(UserOrg::getDelFlag, SystemConstant.DelFlag.DELETED)
                .where(USER_ORG.USER_ID.eq(userId))
                .update();
    }

    /**
     * 为用户添加机构关联
     *
     * @param userId 用户ID
     * @param orgIds 机构ID列表
     * @param primaryOrgId 主机构ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addUserOrgs(String userId, List<String> orgIds, String primaryOrgId) {
        if (orgIds != null && !orgIds.isEmpty()) {
            for (String orgId : orgIds) {
                UserOrg userOrg = new UserOrg();
                userOrg.setUserId(userId);
                userOrg.setOrgId(orgId);
                userOrg.setStatus(SystemConstant.Status.NORMAL);
                
                // 设置主机构标识
                if (StrUtil.isNotEmpty(primaryOrgId) && primaryOrgId.equals(orgId)) {
                    userOrg.setIsPrimary("1"); // 主机构
                } else {
                    userOrg.setIsPrimary("0"); // 非主机构
                }
                
                mapper.insertSelective(userOrg);
            }
        }
    }
}




