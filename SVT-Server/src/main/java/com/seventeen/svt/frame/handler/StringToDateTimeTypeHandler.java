package com.seventeen.svt.frame.handler;

import com.seventeen.svt.common.exception.TypeConversionException;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;

/**
 * String与DateTime字段类型处理器
 * Java中使用String类型，数据库中使用DateTime类型
 * 
 * 数据流向：
 * - 存储：Java String → 解析为LocalDateTime → 数据库DateTime
 * - 读取：数据库DateTime → 格式化为String → Java String
 */
@MappedTypes(String.class)
@MappedJdbcTypes({JdbcType.TIMESTAMP})
public class StringToDateTimeTypeHandler extends BaseTypeHandler<String> {

    private static final String DEFAULT_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private final DateTimeFormatter outputFormatter;
    
    // 支持的输入时间格式列表（用于解析Java传入的String）
    private static final List<DateTimeFormatter> INPUT_FORMATTERS = Arrays.asList(
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.S"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SS"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.S"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SS"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSS"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSSSSS"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd"),
        DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"),
        DateTimeFormatter.ofPattern("yyyy/MM/dd")
    );

    public StringToDateTimeTypeHandler() {
        this(DEFAULT_FORMAT);
    }

    public StringToDateTimeTypeHandler(String outputFormat) {
        this.outputFormatter = DateTimeFormatter.ofPattern(outputFormat);
    }

    /**
     * 存储到数据库：String → DateTime
     * Java传入String，转换为LocalDateTime存入数据库
     */
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, String parameter, JdbcType jdbcType)
            throws SQLException {
        if (StringUtils.isNotBlank(parameter)) {
            LocalDateTime localDateTime = parseStringToLocalDateTime(parameter.trim());
            ps.setTimestamp(i, Timestamp.valueOf(localDateTime));
        } else {
            ps.setNull(i, Types.TIMESTAMP);
        }
    }

    /**
     * 从数据库读取：DateTime → String
     * 数据库返回DateTime，格式化为String返回给Java
     */
    @Override
    public String getNullableResult(ResultSet rs, String columnName) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(columnName);
        return formatTimestampToString(timestamp);
    }

    @Override
    public String getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(columnIndex);
        return formatTimestampToString(timestamp);
    }

    @Override
    public String getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        Timestamp timestamp = cs.getTimestamp(columnIndex);
        return formatTimestampToString(timestamp);
    }

    /**
     * 解析String为LocalDateTime（支持多种格式）
     */
    private LocalDateTime parseStringToLocalDateTime(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }

        // 尝试所有支持的格式
        for (DateTimeFormatter formatter : INPUT_FORMATTERS) {
            try {
                return LocalDateTime.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
                // 继续尝试下一个格式
            }
        }

        // 所有格式都失败，抛出异常
        throw new TypeConversionException(
            String.format("无法将字符串解析为DateTime: '%s'。支持的格式包括: %s", 
                value, getSupportedFormats())
        );
    }

    /**
     * 格式化Timestamp为String
     */
    private String formatTimestampToString(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toLocalDateTime().format(outputFormatter);
    }

    /**
     * 获取支持的时间格式列表（用于错误提示）
     */
    private String getSupportedFormats() {
        return String.join(", ", 
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm:ss.SSS",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd",
            "yyyy/MM/dd HH:mm:ss"
        );
    }
}
