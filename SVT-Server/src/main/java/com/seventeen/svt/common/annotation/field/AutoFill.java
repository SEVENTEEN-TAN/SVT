package com.seventeen.svt.common.annotation.field;

import java.lang.annotation.*;

/**
 * 自动填充注解
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AutoFill {
    /**
     * 填充类型
     */
    FillType type();

    /**
     * 操作类型
     */
    OperationType operation() default OperationType.INSERT_OR_UPDATE;

} 