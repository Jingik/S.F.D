package com.ssafy.backend.domain.user.model.service;

import com.ssafy.backend.domain.user.dto.UserDto;
import com.ssafy.backend.domain.user.entity.Authority;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.repository.UserRepository;
import com.ssafy.backend.global.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원가입
    @Transactional
    public User signup(UserDto userDto) {
        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {  // 이메일 중복만 확인
            throw new RuntimeException("이미 가입되어 있는 유저입니다.");
        }

        // 권한 정보 만들고, 필요한 경우 DB에 저장 (권한이 미리 정의된 경우 생략 가능)
        Authority authority = Authority.builder()
                .authorityName("ROLE_USER")
                .build();

        // 유저 정보를 만들어서 save
        User user = User.builder()
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .name(userDto.getName())
                .nickname(userDto.getNickname())
                .authorities(Collections.singleton(authority))
                .activated(true)
                .build();

        return userRepository.save(user);
    }

    // 이메일을 통해 유저,권한 정보를 확인
    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthorities(String email) {
        return userRepository.findByEmail(email);
    }

    // 현재 로그인한 사용자 정보 확인
    @Transactional(readOnly = true)
    public Optional<User> getMyUserWithAuthorities() {
        return SecurityUtil.getCurrentUsername()
                .flatMap(username -> {
                    System.out.println("Current authenticated user: " + username);  // 현재 인증된 사용자 로그 출력
                    return userRepository.findByEmail(username);
                });
    }

    // 이메일 중복 체크
    public boolean checkEmailDuplicate(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    // 이메일 찾기
    public String findEmailByPhone(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
                .map(User::getEmail)
                .orElse(null);
    }

    // 비밀번호 찾기
    public String findPasswordByEmailAndName(String email, String name) {
        return userRepository.findByEmailAndName(email, name)
                .map(User::getPassword)
                .orElse(null);
    }

    // ID로 사용자 조회 메서드 추가
    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    // 사용자 정보 업데이트
    @Transactional
    public User updateUser(UserDto userDto) {
        User currentUser = getMyUserWithAuthorities().orElseThrow(() -> new RuntimeException("로그인된 사용자가 없습니다."));

        // 변경된 값이 있을 경우에만 업데이트
        if (userDto.getEmail() != null && !userDto.getEmail().equals(currentUser.getEmail())) {
            if (checkEmailDuplicate(userDto.getEmail())) {
                throw new RuntimeException("이미 사용 중인 이메일입니다.");
            }
            currentUser.setEmail(userDto.getEmail());
        }

        if (userDto.getPassword() != null) {
            currentUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        if (userDto.getNickname() != null) {
            currentUser.setNickname(userDto.getNickname());
        }

        return userRepository.save(currentUser);
    }

}