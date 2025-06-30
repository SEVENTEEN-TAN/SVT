package com.seventeen.svt.common.page;

import com.mybatisflex.core.paginate.Page;
import lombok.Data;

import java.util.List;

/**
 * 分页结果
 */
@Data
public class PageResult<T> {
    /**
     * 数据列表
     */
    private List<T> records;
    
    /**
     * 当前页码
     */
    private long current;
    
    /**
     * 每页数量
     */
    private long size;
    
    /**
     * 总记录数
     */
    private long total;
    
    /**
     * 总页数
     */
    private long pages;
    
    /**
     * 是否有下一页
     */
    private boolean hasNext;
    
    /**
     * 是否有上一页
     */
    private boolean hasPrevious;
    
    /**
     * 从MyBatis-Flex的Page对象创建PageResult
     */
    public static <T> PageResult<T> from(Page<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setRecords(page.getRecords());
        result.setCurrent(page.getPageNumber());
        result.setSize(page.getPageSize());
        result.setTotal(page.getTotalRow());
        result.setPages(page.getTotalPage());
        result.setHasNext(page.hasNext());
        result.setHasPrevious(page.hasPrevious());
        return result;
    }
}