package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.modules.system.entity.CodeLibrary;
import com.seventeen.svt.modules.system.mapper.CodeLibraryMapper;
import com.seventeen.svt.modules.system.service.CodeLibraryService;
import org.springframework.stereotype.Service;

/**

* 针对表【code_library(码值库表)】的数据库操作Service实现
*/
@Service
public class CodeLibraryServiceImpl extends ServiceImpl<CodeLibraryMapper, CodeLibrary>
    implements CodeLibraryService{

}




