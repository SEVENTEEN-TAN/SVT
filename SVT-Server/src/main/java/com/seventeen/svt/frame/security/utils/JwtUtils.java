package com.seventeen.svt.frame.security.utils;

import com.seventeen.svt.common.util.MessageUtils;
import com.seventeen.svt.frame.security.config.CustomAuthentication;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT工具类
 */
@Slf4j
@Component
public class JwtUtils {

    //JWT密钥
    @Value("${jwt.secret}")
    private String secret;

    //JWT过期时间
    @Value("${jwt.expiration}")
    private Long expiration;

    //JWt签发者
    @Value("${jwt.issuer}")
    private String issuer;

    /**
     * 生成Token
     */
    public String generateToken(CustomAuthentication customAuthentication) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", customAuthentication.getUserId());
        claims.put("userName", customAuthentication.getName());
        return doGenerateToken(claims, customAuthentication.getUsername());
    }

    /**
     * 从Token中获取用户名
     */
    public String getUsernameFromToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return claims.get("userName", String.class);
        } catch (ExpiredJwtException e) {
            return e.getClaims().get("userName", String.class);
        } catch (Exception e) {
            log.error(MessageUtils.getMessage("log.token.nousername"), e);
            return null;
        }
    }

    /**
     * 从Token中获取用户ID
     */
    public String getUserIdFromToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return claims.get("userId", String.class);
        } catch (ExpiredJwtException e) {
            return e.getClaims().get("userId", String.class);
        } catch (Exception e) {
            log.error(MessageUtils.getMessage("log.token.nouserid"), e);
            return null;
        }
    }

    /**
     * 从Token中获取过期时间
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * 获取Token创建时间
     */
    public Date getIssuedAtDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getIssuedAt);
    }

    /**
     * 获取Token剩余有效期（秒）
     */
    public long getTokenRemainingTime(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return (expiration.getTime() - System.currentTimeMillis()) / 1000;
    }

    /**
     * 检查Token是否过期
     * @param token JWT Token
     * @return true:已过期 false:未过期
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            boolean expired = expiration.before(new Date());
            if (expired) {
                log.warn(MessageUtils.getMessage("log.token.expired"), token);
            }
            return expired;
        } catch (Exception e) {
            log.error(MessageUtils.getMessage("system.servererror"), e);
            return true;
        }
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        final Date createdDate = new Date();
        final Date expirationDate = new Date(createdDate.getTime() + expiration * 1000);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuer(issuer)
                .setIssuedAt(createdDate)
                .setExpiration(expirationDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        try {
            final Claims claims = getAllClaimsFromToken(token);
            return claimsResolver.apply(claims);
        } catch (ExpiredJwtException e) {
            return claimsResolver.apply(e.getClaims());
        }
    }

    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
} 