package com.seventeen.svt.frame.listener;

import cn.hutool.core.util.ObjectUtil;
import com.mybatisflex.annotation.InsertListener;
import com.mybatisflex.annotation.Table;
import com.seventeen.svt.common.annotation.dbkey.DistributedId;
import com.seventeen.svt.common.annotation.field.AutoFill;
import com.seventeen.svt.common.annotation.field.FillType;
import com.seventeen.svt.common.annotation.field.OperationType;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.frame.cache.util.FieldCacheUtils;
import com.seventeen.svt.frame.cache.util.UserDetailCacheUtils;
import com.seventeen.svt.frame.dbkey.DistributedIdGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.lang.reflect.Field;
import java.time.LocalDateTime;

@Slf4j
@Component
public class FlexInsertListener implements InsertListener {

    private final UserDetailCacheUtils userDetailCacheUtils;

    public FlexInsertListener(UserDetailCacheUtils userDetailCacheUtils) {
        this.userDetailCacheUtils = userDetailCacheUtils;
    }

    @Override
    public void onInsert(Object originalObject) {
        log.debug("开始进行插入操作自动填充");
        if (originalObject == null) {
            return;
        }
        try {
            Class<?> clazz = originalObject.getClass();
            Field[] fields = FieldCacheUtils.getFields(clazz);

            for (Field field : fields) {
                processField(field, originalObject);
            }
        } catch (Exception e) {
            log.error("自动填充字段失败", e);
        }
    }

    /**
     * 处理字段
     */
    private void processField(Field field, Object obj) {
        try {
            field.setAccessible(true);
            //处理动态ID
            DistributedId distributedId = field.getAnnotation(DistributedId.class);
            if (distributedId != null) {
                // 获取类上的@TableName注解的值
                String tableName = getTableName(obj.getClass());
                String entityName = obj.getClass().getSimpleName();

                String id = DistributedIdGenerator.generateId(tableName, entityName, distributedId);
                field.set(obj, id);
                log.debug("字段 {} 分布式ID填充完成, 填充值: {}", field.getName(), id);
            }

            //处理自动注入
            AutoFill annotation = field.getAnnotation(AutoFill.class);
            if (annotation != null && !OperationType.UPDATE.equals(annotation.operation())) {
                Object value = getFieldValue(annotation.type());
                field.set(obj, value);
                log.debug("字段 {} 自动填充完成, 填充值: {}", field.getName(), value);
                return;
            }
        } catch (Exception e) {
            log.error("字段 {} 填充失败", field.getName(), e);
        }
    }

    /**
     * 获取字段值
     */
    private Object getFieldValue(FillType fillType) {
        //获取当前操作人的缓存
        UserDetailCache userDetail = null;
        try {
            String requestUserId = RequestContextUtils.getRequestUserId();
            userDetail = userDetailCacheUtils.getUserDetail(requestUserId);
        } catch (Exception e) {
            log.debug("无法从上下文获取获取当前登录用户");
        }
        return switch (fillType) {
            case USER_ID -> ObjectUtil.isNull(userDetail)?"":userDetail.getUserId();
            case ORG_ID -> ObjectUtil.isNull(userDetail)?"":userDetail.getOrgId();
            case ROLE_ID -> ObjectUtil.isNull(userDetail)?"":userDetail.getRoleId();
            case IP -> ObjectUtil.isNull(userDetail)?"":userDetail.getLoginIp();
            case TIME -> LocalDateTime.now();
        };
    }

    /**
     * 获取表名
     */
    private String getTableName(Class<?> clazz) {
        Table tableNameAnnotation = clazz.getAnnotation(Table.class);
        if (tableNameAnnotation != null && StringUtils.hasText(tableNameAnnotation.value())) {
            return tableNameAnnotation.value();
        }
        // 如果没有@TableName注解或值为空,使用类名(首字母小写)作为表名
        String className = clazz.getSimpleName();
        return Character.toLowerCase(className.charAt(0)) + className.substring(1);
    }
}
