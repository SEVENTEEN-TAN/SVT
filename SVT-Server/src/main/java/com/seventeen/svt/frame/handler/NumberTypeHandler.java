package com.seventeen.svt.frame.handler;

import com.seventeen.svt.common.exception.TypeConversionException;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.*;

/**
 * 自定义BigDecimal字段类型处理器
 * 使用@MappedTypes注解指定该类型处理器所处理的自定义对象（BigDecimal类型）
 * 使用@MappedJdbcTypes注解将该类型处理器所处理的自定义对象（BigDecimal类型）和对应的数据库类型（varchar）对应起来
 */
@MappedTypes(Number.class)
@MappedJdbcTypes(JdbcType.VARCHAR)
public class NumberTypeHandler extends BaseTypeHandler<Number> {
    
    private final Class<? extends Number> targetType;
    
    public NumberTypeHandler(Class<? extends Number> targetType) {
        this.targetType = targetType;
    }

    /**
     * 自定义设定参数时的操作（自定义类型 -> 数据库基本类型）
     * 即定义当我们执行insert、delete或者update操作，在Mapper方法传入Number类型作为参数时，要如何将其转换数据库表对应的字符串形式
     *
     * @param ps        JDBC的Statement对象，用于参数化执行SQL语句
     * @param i         表示Number类型参数的下标
     * @param parameter 我们传入的具体的Number类型参数
     * @param jdbcType  JDBC类型
     */
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Number parameter, JdbcType jdbcType) 
            throws SQLException {
        if (parameter != null) {
            ps.setString(i, parameter.toString());
        } else {
            ps.setNull(i, Types.VARCHAR);
        }
    }


    /**
     * 定义获取结果时的操作（数据库基本类型 -> 自定义类型）
     * 即定义当我们查询到的对象中有Number类型字段时，如何将数据表中使用字符串类型表示的边界转换成我们的Number对象
     * 该方法使用列名获取原始字段值
     *
     * @param rs         查询得到的全部列
     * @param columnName 该列的列名
     * @return 转换后的Number对象
     */
    @Override
    public Number getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return toNumber(value);
    }


    /**
     * 定义获取结果时的操作（重载）
     * 该方法使用下标获取原始字段值
     */
    @Override
    public Number getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return toNumber(value);
    }

    /**
     * 定义获取结果时的操作（重载）
     * 该方法使用CallableStatement获取原始字段值
     */
    @Override
    public Number getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return toNumber(value);
    }

    /**
     * String转换成Number
     * @param value String
     * @return Number
     */
    private Number toNumber(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        try {
            value = value.trim();
            if (targetType == Integer.class) {
                return Integer.valueOf(value);
            } else if (targetType == Long.class) {
                return Long.valueOf(value);
            } else if (targetType == Double.class) {
                return Double.valueOf(value);
            } else if (targetType == Float.class) {
                return Float.valueOf(value);
            } else {
                throw new TypeConversionException("不支持的数字类型: " + targetType);
            }
        } catch (NumberFormatException e) {
            throw new TypeConversionException("无法将字符串转换为" + targetType.getSimpleName() + ": " + value, e);
        }
    }
}