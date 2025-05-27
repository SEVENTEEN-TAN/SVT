package com.seventeen.svt.common.config;

import com.seventeen.svt.common.util.Sm4Utils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * SM4密码编码器
 */
@Component
public class Sm4PasswordEncoder implements PasswordEncoder {


    @Override
    public String encode(CharSequence rawPassword) {
        return Sm4Utils.encrypt(rawPassword.toString());
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return Sm4Utils.verifyPassword(rawPassword.toString(), encodedPassword);
    }
} 