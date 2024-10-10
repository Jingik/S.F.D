package com.ssafy.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordEncryptor {

    public static void main(String[] args) {
        // PasswordEncoder 인스턴스 생성
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        // 암호화할 기존 비밀번호
        String rawPassword = "ssafy1234!"; // 여기서 암호화하려는 비밀번호를 입력

        // 비밀번호 암호화
        String encryptedPassword = passwordEncoder.encode(rawPassword);

        // 암호화된 비밀번호 출력
        System.out.println("Encrypted Password: " + encryptedPassword);
    }
}
