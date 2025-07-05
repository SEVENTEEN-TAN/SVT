package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.entity.CodeLibrary;
import com.seventeen.svt.modules.system.mapper.CodeLibraryMapper;
import com.seventeen.svt.modules.system.service.CodeLibraryService;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.CODE_LIBRARY;

/**

* 针对表【code_library(码值库表)】的数据库操作Service实现
*/
@Service
public class CodeLibraryServiceImpl extends ServiceImpl<CodeLibraryMapper, CodeLibrary>
    implements CodeLibraryService{

    /**
     * 根据码值类型获取码值列表
     * @param codeType 码值类型
     * @return 码值列表
     */
    @Override
    public List<CodeLibrary> selectCodeLibraryByCodeType(String codeType) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(CODE_LIBRARY.ALL_COLUMNS)
                .from(CODE_LIBRARY)
                .where(CODE_LIBRARY.CODE_TYPE.eq(codeType).and(CODE_LIBRARY.STATUS.eq(SystemConstant.Status.NORMAL)))
                .orderBy(CODE_LIBRARY.CODE_SORT, true);
        return mapper.selectListByQuery(queryWrapper);
    }
}




