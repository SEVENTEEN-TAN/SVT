package com.seventeen.svt.frame.handler;

import com.seventeen.svt.common.exception.TypeConversionException;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * 自定义BigDecimal字段类型处理器
 * 使用@MappedTypes注解指定该类型处理器所处理的自定义对象（BigDecimal类型）
 * 使用@MappedJdbcTypes注解将该类型处理器所处理的自定义对象（BigDecimal类型）和对应的数据库类型（varchar）对应起来
 */
@MappedTypes(BigDecimal.class)
@MappedJdbcTypes(JdbcType.VARCHAR)
public class BigDecimalTypeHandler extends BaseTypeHandler<BigDecimal> {

    /**
     * 自定义设定参数时的操作（自定义类型 -> 数据库基本类型）
     * 即定义当我们执行insert、delete或者update操作，在Mapper方法传入BigDecimal类型作为参数时，要如何将其转换数据库表对应的字符串形式
     *
     * @param ps        JDBC的Statement对象，用于参数化执行SQL语句
     * @param i         表示BigDecimal类型参数的下标
     * @param parameter 我们传入的具体的BigDecimal类型参数
     * @param jdbcType  JDBC类型
     */
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, BigDecimal parameter, JdbcType jdbcType) throws SQLException {
        // 将我们的BigDecimal类型参数转换成字符串使得可以存入或者更新至数据库
        String convertedBoundary = parameter.toString();
        // 设定至参数化Statement对象中填充对应参数
        ps.setString(i, convertedBoundary);
    }


    /**
     * 定义获取结果时的操作（数据库基本类型 -> 自定义类型）
     * 即定义当我们查询到的对象中有BigDecimal类型字段时，如何将数据表中使用字符串类型表示的边界转换成我们的BigDecimal对象
     * 该方法使用列名获取原始字段值
     *
     * @param rs         查询得到的全部列
     * @param columnName 该列的列名
     * @return 转换后的BigDecimal对象
     */
    @Override
    public BigDecimal getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return toBigDecimal(value);
    }


    /**
     * 定义获取结果时的操作（重载）
     * 该方法使用下标获取原始字段值
     */
    @Override
    public BigDecimal getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return toBigDecimal(value);
    }

    /**
     * 定义获取结果时的操作（重载）
     * 该方法使用CallableStatement获取原始字段值
     */
    @Override
    public BigDecimal getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return toBigDecimal(value);
    }

    /**
     * String转换成BigDecimal
     * @param value String
     * @return BigDecimal
     */
    private BigDecimal toBigDecimal(String value) {
        try {
            return StringUtils.isBlank(value) ? null : new BigDecimal(value.trim());
        } catch (NumberFormatException e) {
            throw new TypeConversionException("无法将字符串转换为BigDecimal: " + value, e);
        }
    }
}
