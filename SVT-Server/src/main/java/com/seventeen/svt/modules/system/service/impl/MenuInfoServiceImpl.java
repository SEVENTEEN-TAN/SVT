package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.modules.system.entity.MenuInfo;
import com.seventeen.svt.modules.system.mapper.MenuInfoMapper;
import com.seventeen.svt.modules.system.service.MenuInfoService;
import org.springframework.stereotype.Service;

/**

* 针对表【menu_info(菜单表)】的数据库操作Service实现
*/
@Service
public class MenuInfoServiceImpl extends ServiceImpl<MenuInfoMapper, MenuInfo>
    implements MenuInfoService{

}




