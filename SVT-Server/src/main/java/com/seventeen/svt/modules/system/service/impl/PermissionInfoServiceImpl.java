package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.modules.system.entity.PermissionInfo;
import com.seventeen.svt.modules.system.mapper.PermissionInfoMapper;
import com.seventeen.svt.modules.system.service.PermissionInfoService;
import org.springframework.stereotype.Service;

/**
* 针对表【permission_info(权限表)】的数据库操作Service实现
*/
@Service
public class PermissionInfoServiceImpl extends ServiceImpl<PermissionInfoMapper, PermissionInfo>
    implements PermissionInfoService{

}




