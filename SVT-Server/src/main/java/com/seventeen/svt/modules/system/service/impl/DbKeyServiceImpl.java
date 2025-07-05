package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.modules.system.entity.DbKey;
import com.seventeen.svt.modules.system.mapper.DbKeyMapper;
import com.seventeen.svt.modules.system.service.DbKeyService;
import org.springframework.stereotype.Service;

import java.util.Date;

import static com.seventeen.svt.modules.system.entity.table.Tables.DB_KEY;

/**
 * 分布式ID配置服务实现
 */
@Service
public class DbKeyServiceImpl extends ServiceImpl<DbKeyMapper, DbKey>
        implements DbKeyService {

    @Override
    public DbKey getByTableNameAndFieldName(String tableName, String fieldName) {
        QueryWrapper sqlWrapper = QueryWrapper.create()
                .select(DB_KEY.ALL_COLUMNS)
                .from(DB_KEY)
                .where(DB_KEY.TABLE_NAME.eq(tableName))
                .and(DB_KEY.FIELD_NAME.eq(fieldName));
        return mapper.selectOneByQuery(sqlWrapper);
    }

    @Override
    public void updateCurrentId(String tableName, String fieldName, Long currentId) {
        UpdateChain
                .of(DbKey.class)
                .set(DbKey::getCurrentId, currentId)
                .setRaw(DbKey::getLastUpdateTime, "GETDATE()")
                .where(DbKey::getTableName).eq(tableName)
                .and(DbKey::getFieldName).eq(fieldName)
                .update();
    }

    @Override
    public void updateCurrentLetterPosition(String tableName, String fieldName, Integer currentLetterPosition) {
        UpdateChain
                .of(DbKey.class)
                .set(DbKey::getCurrentLetterPosition, currentLetterPosition)
                .setRaw(DbKey::getLastUpdateTime, "GETDATE()")
                .where(DbKey::getTableName).eq(tableName)
                .and(DbKey::getFieldName).eq(fieldName)
                .update();
    }

    @Override
    public void updateCurrentDate(String tableName, String fieldName, Date recordDate) {
        UpdateChain
                .of(DbKey.class)
                .set(DbKey::getRecordDate, recordDate)
                .setRaw(DbKey::getLastUpdateTime, "GETDATE()")
                .where(DbKey::getTableName).eq(tableName)
                .and(DbKey::getFieldName).eq(fieldName)
                .update();
    }

    @Override
    public void create(DbKey dbKey) {
        mapper.insertWithPk(dbKey);
    }
}
