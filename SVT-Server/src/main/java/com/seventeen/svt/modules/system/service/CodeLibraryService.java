package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.entity.CodeLibrary;

import java.util.List;

/**
* 针对表【code_library(码值库表)】的数据库操作Service
*/
public interface CodeLibraryService extends IService<CodeLibrary> {

    /**
     * 根据码值类型获取码值列表
     * @param codeType 码值类型
     * @return 码值列表
     */
    List<CodeLibrary> selectCodeLibraryByCodeType(String codeType);
}
