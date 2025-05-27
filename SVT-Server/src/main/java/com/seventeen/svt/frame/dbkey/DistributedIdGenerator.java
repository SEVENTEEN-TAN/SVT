package com.seventeen.svt.frame.dbkey;

import cn.hutool.extra.spring.SpringUtil;
import com.seventeen.svt.common.annotation.dbkey.DistributedId;
import com.seventeen.svt.common.util.DistributedLockUtil;
import com.seventeen.svt.frame.cache.util.DbKeyCacheUtil;
import com.seventeen.svt.modules.system.entity.DbKey;
import com.seventeen.svt.modules.system.service.DbKeyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 分布式ID生成器
 */
@Slf4j
@Component
public class DistributedIdGenerator {

    /**
     * 生成ID
     */
    public static String generateId(String tableName, String entityName, DistributedId annotation) {
        // 先从缓存获取ID
        String id = getIdFromCache(tableName);
        if (id != null) {
            return id;
        }

        // 缓存中没有ID,需要从DB获取一批新ID
        String lockKey = DistributedLockUtil.getLockKey(tableName);
        String lockValue = DistributedLockUtil.tryLock(lockKey, 5, 10, TimeUnit.SECONDS);

        if (lockValue == null) {
            throw new RuntimeException("获取分布式锁失败");
        }

        try {
            // 再次检查缓存(可能其他线程已经获取了新ID)
            id = getIdFromCache(tableName);
            if (id != null) {
                return id;
            }

            // 获取配置
            DbKey dbKey = getOrCreateConfig(tableName, entityName, annotation);

            // 获取当前日期
            String currentDate = LocalDate.now().format(DateTimeFormatter.ofPattern(annotation.dateFormat()));

            // 检查数据库中的日期是否变更
            String dbDate = null;
            if (dbKey.getRecordDate() != null) {
                SimpleDateFormat sdf = new SimpleDateFormat(dbKey.getDateFormat());
                dbDate = sdf.format(dbKey.getRecordDate());
            }

            DbKeyService dbKeyServiceImpl = SpringUtil.getBean("dbKeyServiceImpl", DbKeyService.class);
            // 如果数据库中的日期不同于当前日期,重置ID
            if (dbDate == null || !dbDate.equals(currentDate)) {
                log.info("日期变更: {} -> {}, 重置ID为1", dbDate, currentDate);
                dbKey.setCurrentId(1L);
                dbKey.setCurrentLetterPosition(0);
                dbKey.setRecordDate(new Date()); // 设置当前日期
                dbKeyServiceImpl.updateCurrentDate(dbKey.getTableName(), dbKey.getRecordDate());
                dbKeyServiceImpl.updateCurrentId(dbKey.getTableName(), dbKey.getCurrentId());
                dbKeyServiceImpl.updateCurrentLetterPosition(dbKey.getTableName(), dbKey.getCurrentLetterPosition());
            }

            // 生成一批ID
            List<String> ids = generateBatchIds(dbKey);

            // 保存到缓存
            DbKeyCacheUtil.putIds(tableName, ids);

            // 返回第一个ID
            return ids.remove(0);
        } finally {
            DistributedLockUtil.unlock(lockKey, lockValue);
        }
    }

    /**
     * 从缓存获取ID
     */
    private static String getIdFromCache(String tableName) {
        List<String> ids = DbKeyCacheUtil.getIds(tableName);
        if (ids != null && !ids.isEmpty()) {
            String id = ids.remove(0);
            // 更新缓存
            DbKeyCacheUtil.putIds(tableName, ids);
            return id;
        }
        return null;
    }

    /**
     * 生成一批ID
     */
    private static List<String> generateBatchIds(DbKey dbKey) {
        List<String> ids = new ArrayList<>();
        long startId = dbKey.getCurrentId();
        int batchSize = dbKey.getBatchSize();

        // 使用当前日期格式化
        String currentDate = LocalDate.now().format(DateTimeFormatter.ofPattern(dbKey.getDateFormat()));

        for (int i = 0; i < batchSize; i++) {
            long currentId = startId + i;
            String number;

            // 检查是否需要字母扩展
            if (dbKey.getCurrentLetterPosition() > 0) {
                number = generateLetterNumber(currentId, dbKey.getCurrentLetterPosition(), dbKey.getPaddingLength());
            } else {
                number = formatNumber(currentId, dbKey.getPaddingLength());
            }

            String id = String.format("%s%s%s", dbKey.getPrefix(), currentDate, number);
            ids.add(id);
        }

        // 更新数据库中的当前ID
        long newCurrentId = startId + batchSize;

        DbKeyService dbKeyServiceImpl = SpringUtil.getBean("dbKeyServiceImpl", DbKeyService.class);

        // 检查是否需要进位
        long maxNumber = (long) Math.pow(10, dbKey.getPaddingLength());
        if (newCurrentId > maxNumber) {
            newCurrentId = 1;
            dbKey.setCurrentLetterPosition(dbKey.getCurrentLetterPosition() + 1);
            dbKeyServiceImpl.updateCurrentLetterPosition(dbKey.getTableName(), dbKey.getCurrentLetterPosition());
        }

        // 更新DB中的当前ID
        dbKey.setCurrentId(newCurrentId);
        dbKeyServiceImpl.updateCurrentId(dbKey.getTableName(), newCurrentId);

        // 更新缓存
        DbKeyCacheUtil.put(dbKey.getTableName(), dbKey);

        return ids;
    }

    /**
     * 获取或创建配置
     */
    private static DbKey getOrCreateConfig(String tableName, String entityName, DistributedId annotation) {
        // 从缓存获取
        DbKey dbKey = DbKeyCacheUtil.get(tableName);
        if (dbKey != null) {
            return dbKey;
        }

        DbKeyService dbKeyServiceImpl = SpringUtil.getBean("dbKeyServiceImpl", DbKeyService.class);

        // 从数据库获取
        dbKey = dbKeyServiceImpl.getByTableName(tableName);
        if (dbKey == null) {
            // 创建新配置
            dbKey = new DbKey();
            dbKey.setTableName(tableName);
            dbKey.setEntityName(entityName);
            dbKey.setPrefix(annotation.prefix());
            dbKey.setDateFormat(annotation.dateFormat());
            dbKey.setBatchSize(annotation.batchSiz());
            dbKey.setPaddingLength(annotation.paddingLength());
            dbKey.setCurrentId(1L);
            dbKey.setCurrentLetterPosition(0);
            dbKey.setRecordDate(new Date()); // 设置当前日期

            // 保存到数据库
            dbKeyServiceImpl.create(dbKey);
        }

        // 更新缓存
        DbKeyCacheUtil.put(tableName, dbKey);
        return dbKey;
    }

    /**
     * 格式化数字
     */
    private static String formatNumber(long number, int paddingLength) {
        return String.format("%0" + paddingLength + "d", number);
    }

    /**
     * 生成带字母的编号
     */
    private static String generateLetterNumber(long number, int letterPosition, int paddingLength) {
        StringBuilder result = new StringBuilder();

        // 添加字母
        for (int i = 0; i < letterPosition; i++) {
            result.append((char) ('A' + i));
        }

        // 添加数字
        int remainingLength = paddingLength - letterPosition;
        result.append(formatNumber(number, remainingLength));

        return result.toString();
    }
}
