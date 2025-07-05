package com.seventeen.svt.common.config;

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class SVTArgon2PasswordEncoder implements PasswordEncoder {

    private final Argon2PasswordEncoder argon2PasswordEncoder;

    public SVTArgon2PasswordEncoder() {
        this.argon2PasswordEncoder = new Argon2PasswordEncoder(16, 32, 1, 4096, 3);
    }

    @Override
    public String encode(CharSequence rawPassword) {
        if (rawPassword == null) {
            throw new IllegalArgumentException("rawPassword cannot be null");
        }
        return argon2PasswordEncoder.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null) {
            throw new IllegalArgumentException("rawPassword cannot be null");
        }
        if (encodedPassword == null || encodedPassword.length() == 0) {
            return false;
        }
        return argon2PasswordEncoder.matches(rawPassword, encodedPassword);
    }

    @Override
    public boolean upgradeEncoding(String encodedPassword) {
        return argon2PasswordEncoder.upgradeEncoding(encodedPassword);
    }
} 