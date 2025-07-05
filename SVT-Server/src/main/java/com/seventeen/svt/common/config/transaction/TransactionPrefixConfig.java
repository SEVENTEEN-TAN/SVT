package com.seventeen.svt.common.config.transaction;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 事务前缀配置
 * 配置不同事务类型的方法名前缀
 */
@Component
@ConfigurationProperties(prefix = "transaction.prefix")
@Data
public class TransactionPrefixConfig {

    /**
     * 只读事务方法前缀
     */
    private List<String> readonly = new ArrayList<>();

    /**
     * 读写事务方法前缀
     */
    private List<String> required = new ArrayList<>();

    /**
     * 无事务方法前缀
     */
    private List<String> none = new ArrayList<>();
} 