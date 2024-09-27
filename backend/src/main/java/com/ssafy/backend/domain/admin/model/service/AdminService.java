package com.ssafy.backend.domain.admin.model.service;

import com.ssafy.backend.domain.user.entity.Authority;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    // 모든 유저 조회
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 유저 활성화
    public void activateUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setActivated(true); // 유저 활성화 상태로 변경
        userRepository.save(user); // 유저 상태 저장
    }

    // 유저 비활성화
    public void deactivateUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setActivated(false); // 유저 비활성화 상태로 변경
        userRepository.save(user); // 유저 상태 저장
    }

    // 유저 삭제
    public void deleteUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        userRepository.delete(user); // 유저 삭제
    }

    // 유저 권한 업데이트
    public void updateUserRole(String email, String role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        // 기존 권한 제거
        user.getAuthoritiesSet().clear();  // 권한 초기화

        // 새로운 권한 추가 (Authority 객체로 변환하여 저장)
        Authority newAuthority = Authority.builder()
                .authorityName(role)
                .build();

        // 권한 추가
        user.getAuthoritiesSet().add(newAuthority);

        // 유저 정보 저장
        userRepository.save(user);
    }
}
