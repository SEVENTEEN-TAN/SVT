package com.seventeen.svt;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * OCBC LES SVT管理系统启动类
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableCaching
@EnableScheduling
@EnableConfigurationProperties
@MapperScan({"com.seventeen.svt.modules.*.mapper", "com.seventeen.svt.frame.*.mapper"})
public class RiskManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(RiskManagementApplication.class, args);
    }

} 