package com.seventeen.svt.modules.system.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Table;
import com.seventeen.svt.common.annotation.field.AutoFill;
import com.seventeen.svt.common.annotation.field.FillType;
import com.seventeen.svt.common.annotation.field.OperationType;
import com.seventeen.svt.frame.listener.FlexInsertListener;
import com.seventeen.svt.frame.listener.FlexUpdateListener;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * @TableName db_key
 */
@Table(value = "db_key", comment = "动态主键表",
        onInsert = FlexInsertListener.class, onUpdate = FlexUpdateListener.class)
@Data
public class DbKey implements Serializable {

    @Column(value = "table_name", comment = "表名")
    private String tableName;

    @Column(value = "field_name", comment = "字段名")
    private String fieldName;

    @Column(value = "entity_name", comment = "实体类名")
    private String entityName;

    @Column(value = "prefix", comment = "ID前缀")
    private String prefix;

    @Column(value = "date_format", comment = "日期格式")
    private String dateFormat;

    @Column(value = "padding_length", comment = "补充位数")
    private Integer paddingLength;

    @Column(value = "batch_size", comment = "批量获取数量")
    private Integer batchSize;

    @Column(value = "current_id", comment = "当前起始ID")
    private Long currentId;

    @Column(value = "current_letter_position", comment = "当前字母位置(用于扩展容量)")
    private Integer currentLetterPosition;

    @Column(value = "record_date", comment = "当前日期")
    private Date recordDate;

    @AutoFill(type = FillType.TIME, operation = OperationType.INSERT_OR_UPDATE)
    @Column(value = "last_update_time", comment = "最后更新时间")
    private LocalDateTime lastUpdateTime;

    @Serial
    @Column(ignore = true)
    private static final long serialVersionUID = 1L;

    /**
     * 生成复合主键
     * 格式：表名_字段名
     */
    public String getCompositeKey() {
        return tableName + "_" + fieldName;
    }

    /**
     * 从复合主键解析表名和字段名
     */
    public static String[] parseCompositeKey(String compositeKey) {
        if (compositeKey == null || !compositeKey.contains("_")) {
            throw new IllegalArgumentException("Invalid composite key format: " + compositeKey);
        }
        int lastIndex = compositeKey.lastIndexOf("_");
        String tableName = compositeKey.substring(0, lastIndex);
        String fieldName = compositeKey.substring(lastIndex + 1);
        return new String[]{tableName, fieldName};
    }
}