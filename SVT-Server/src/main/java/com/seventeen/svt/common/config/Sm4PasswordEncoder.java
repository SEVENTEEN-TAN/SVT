package com.seventeen.svt.common.config;

import com.seventeen.svt.common.util.Sm4Utils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * SM4密码编码器
 */
@Component
public class Sm4PasswordEncoder implements PasswordEncoder {

    private final Sm4Utils sm4Utils;

    public Sm4PasswordEncoder(Sm4Utils sm4Utils) {
        this.sm4Utils = sm4Utils;
    }

    @Override
    public String encode(CharSequence rawPassword) {
        return sm4Utils.encrypt(rawPassword.toString());
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return sm4Utils.verifyPassword(rawPassword.toString(), encodedPassword);
    }
} 