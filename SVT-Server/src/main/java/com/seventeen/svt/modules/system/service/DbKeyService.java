package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.entity.DbKey;

import java.util.Date;

/**
 * 分布式ID配置服务接口
 */
public interface DbKeyService extends IService<DbKey> {

    /**
     * 根据表名查询配置
     * @param tableName 表名
     * @return 配置
     */
    DbKey getByTableName(String tableName);

    /**
     * 更新当前ID
     * @param tableName 表名
     * @param currentId 当前ID
     */
    void updateCurrentId(String tableName, Long currentId);

    /**
     * 更新当前字母位置
     * @param tableName 表名
     * @param currentLetterPosition 当前字母位置
     */
    void updateCurrentLetterPosition(String tableName, Integer currentLetterPosition);

    /**
     * 更新当前日期
     * @param tableName 表名
     * @param recordDate 记录日期
     */
    void updateCurrentDate(String tableName, Date recordDate);

    /**
     * 创建配置
     * @param dbKey 配置
     */
    void create(DbKey dbKey);
}