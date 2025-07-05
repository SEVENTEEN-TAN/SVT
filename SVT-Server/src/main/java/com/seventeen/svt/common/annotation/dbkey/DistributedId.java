package com.seventeen.svt.common.annotation.dbkey;

import java.lang.annotation.*;

/**
 * 分布式ID注解
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DistributedId {
    /**
     * 前缀
     */
    String prefix() default "";

    /**
     * 日期格式
     */
    String dateFormat() default "yyyyMMdd";


    /**
     * 补充位数
     */
    int paddingLength() default 6;

    /**
     * 每次取数
     */
    int batchSize() default 100;
}
