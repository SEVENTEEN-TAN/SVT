package com.seventeen.svt.frame.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 系统启动监听器
 */
@Slf4j
@Component
public class SystemStartupListener implements CommandLineRunner {

    @Autowired
    private Environment environment;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RedisConnectionFactory redisConnectionFactory;


    @Override
    public void run(String... args) {
        // 打印系统启动信息
        printSystemStartupInfo();
        
        // 执行系统初始化检查
        performSystemChecks();
        
        // 初始化系统数据
        initializeSystemData();
    }

    /**
     * 打印系统启动信息
     */
    private void printSystemStartupInfo() {
        // 打印ASCII艺术字体
        log.info("\n" +
                "  ______     _______ \n" +
                " / ___\\ \\   / /_   _|\n" +
                " \\___ \\\\ \\ / /  | |  \n" +
                "  ___) |\\ V /   | |  \n" +
                " |____/  \\_/    |_|  by.SEVENTEEN\n");

        // 打印系统信息
        log.info("===============================================");
        log.info("系统名称: SVT Manager");
        log.info("系统版本: 1.0.0");
        log.info("启动时间: {}", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        log.info("运行环境: {}", environment.getActiveProfiles()[0]);
        log.info("服务端口: {}", environment.getProperty("server.port"));
        log.info("===============================================\n");
    }

    /**
     * 执行系统初始化检查
     */
    private void performSystemChecks() {
        log.info("开始执行系统初始化检查...");
        
        // 检查数据库连接
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            log.info("数据库连接检查: 成功 √");
        } catch (Exception e) {
            log.error("数据库连接检查: 失败 X", e);
            throw new RuntimeException("数据库连接失败", e);
        }

        // 检查Redis连接（如果配置了Redis）
        String redisHost = environment.getProperty("spring.data.redis.host");
        if (redisHost != null) {
            try (var connection = redisConnectionFactory.getConnection()) {
                String pingResponse = connection.ping();
                if ("PONG".equals(pingResponse)) {
                    log.info("Redis连接检查: 成功 √");
                } else {
                    log.error("Redis连接检查: 失败 X");
                    throw new RuntimeException("Redis连接失败，响应不正确");
                }
            } catch (Exception e) {
                log.error("Redis连接检查: 失败", e);
                throw new RuntimeException("Redis连接失败", e);
            }
        } else {
            log.info("Redis连接检查: 未配置，跳过检查");
        }

        // 检查系统配置
        checkSystemConfig();
        
        log.info("系统初始化检查完成\n");
    }

    /**
     * 检查系统配置
     */
    private void checkSystemConfig() {
        log.info("开始检查系统关键表是否正确初始化..");
        //此时需要检查对应的表是否正确初始化
        try {
             this.checkTableInitialization("audit_log");
             this.checkTableInitialization("code_library");
             this.checkTableInitialization("db_key");
             this.checkTableInitialization("menu_info");
             this.checkTableInitialization("menu_role");
             this.checkTableInitialization("org_info");
             this.checkTableInitialization("permission_info");
             this.checkTableInitialization("role_info");
             this.checkTableInitialization("role_menu");
             this.checkTableInitialization("role_permission");
             this.checkTableInitialization("user_info");
             this.checkTableInitialization("user_org");
             this.checkTableInitialization("user_role");
        } catch (DataAccessException e) {
            log.error("系统关键表未初始化: 失败 X", e);
            throw new RuntimeException("系统关键表未初始化", e);
        }
        log.info("系统关键表已经正确初始化..");
    }

    /**
     * 检查表是否正确初始化
     * @param tableName
     */
    private void checkTableInitialization(String tableName) {
        try {
            // 使用 COUNT 查询来检查表中是否有数据
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Integer.class);
//            log.info("表 {} 中的记录数: {}", tableName, count);
        } catch (EmptyResultDataAccessException e) {
//            log.warn("表 {} 为空，允许空表存在", tableName);
        } catch (IncorrectResultSizeDataAccessException e) {
//            log.error("表 {} 查询返回多条记录，预期1条，实际返回: {}", tableName, e.getActualSize());
        } catch (Exception e) {
            log.error("检查表 {} 时发生错误", tableName, e);
            throw new RuntimeException("检查表 " + tableName + " 时发生错误", e);
        }
    }

    /**
     * 初始化系统必要数据到缓存
     */
    private void initializeSystemData() {
        log.info("开始初始化系统必要数据到缓存...");
        //TODO: 一些必要缓存可以在此处优先预载到本地
        
        log.info("系统数据初始化完成\n");
    }
} 