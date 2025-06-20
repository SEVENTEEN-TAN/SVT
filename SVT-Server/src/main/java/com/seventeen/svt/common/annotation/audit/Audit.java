package com.seventeen.svt.common.annotation.audit;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Audit {
    /**
     * 操作描述
     */
    String description() default "";

    /**
     * 是否记录请求参数
     */
    boolean recordParams() default true;

    /**
     * 是否记录响应结果
     */
    boolean recordResult() default false;

    /**
     * 是否记录异常信息
     */
    boolean recordException() default true;

    /**
     * 是否进行脱敏处理
     */
    boolean sensitive() default true;
}