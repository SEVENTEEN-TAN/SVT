package com.seventeen.svt.common.annotation.audit;

/**
 * 敏感信息脱敏策略
 */
public enum SensitiveStrategy {
    /**
     * 默认策略：保留首尾字符，中间用*替换
     * 适用于ID、Key等通用敏感字段
     */
    DEFAULT,
    
    /**
     * 身份证号
     */
    ID_CARD,

    /**
     * 手机号
     */
    PHONE,

    /**
     * 密码
     */
    PASSWORD,

    /**
     * 银行卡号
     */
    BANK_CARD,

    /**
     * 邮箱
     */
    EMAIL,

    /**
     * 姓名
     */
    NAME
}