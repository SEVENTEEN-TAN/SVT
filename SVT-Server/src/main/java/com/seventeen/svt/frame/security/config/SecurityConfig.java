package com.seventeen.svt.frame.security.config;

import com.seventeen.svt.common.config.SecurityPathConfig;
import com.seventeen.svt.common.config.SVTArgon2PasswordEncoder;
import com.seventeen.svt.frame.security.filter.JwtAuthenticationFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Spring Security配置类
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final SVTArgon2PasswordEncoder argon2PasswordEncoder;

    public SecurityConfig(
            @Lazy JwtAuthenticationFilter jwtAuthenticationFilter,
            SVTArgon2PasswordEncoder argon2PasswordEncoder) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.argon2PasswordEncoder = argon2PasswordEncoder;
    }

    /**
     * 配置安全过滤器链
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // 获取不带上下文路径的放行路径数组
        String[] permitAllPaths = SecurityPathConfig.getPermitAllPathsWithoutContext();
        
        return http
            // 禁用基本认证
            .httpBasic(AbstractHttpConfigurer::disable)
            // 禁用CSRF
            .csrf(AbstractHttpConfigurer::disable)
            // 基于token,不需要session
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 配置请求授权
            .authorizeHttpRequests(auth -> {
                // 逐个添加放行路径，确保使用AntPathRequestMatcher
                for (String path : permitAllPaths) {
                    auth.requestMatchers(new AntPathRequestMatcher(path)).permitAll();
                }
                auth.anyRequest().authenticated();
            })
            // 添加JWT过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    /**
     * 配置密码编码器
     * 使用Argon2替代SM4，提供更高的安全性
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return argon2PasswordEncoder;
    }
} 