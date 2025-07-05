package com.seventeen.svt.common.annotation.permission;

import java.lang.annotation.*;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresPermission {
    /**
     * 权限标识
     */
    String value();

    /**
     * 是否需要验证所有权限,默认只要有其中一个即可
     */
    boolean requireAll() default false;
}