package com.seventeen.svt.common.page;

import com.mybatisflex.core.paginate.Page;
import lombok.Data;

/**
 * 分页查询参数
 */
@Data
public class PageQuery<T> {
    /**
     * 当前页码
     */
    private int pageNumber = 1;
    
    /**
     * 每页数量
     */
    private int pageSize = 10;

    /**
     * 查询条件
     */
    private T condition;

}