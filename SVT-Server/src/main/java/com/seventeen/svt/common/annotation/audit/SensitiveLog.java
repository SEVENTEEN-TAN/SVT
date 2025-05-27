package com.seventeen.svt.common.annotation.audit;

import java.lang.annotation.*;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface SensitiveLog {
    /**
     * 脱敏策略
     */
    SensitiveStrategy strategy();
}
