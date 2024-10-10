package com.ssafy.backend.domain.connection.model.service;

import com.ssafy.backend.domain.scanner.model.repository.ScannersRepository;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {

    // 사용자별 현재 시리얼 넘버를 저장하기 위한 맵
    private final Map<Long, Long> userSerialNumbers = new ConcurrentHashMap<>();
    private final UserService userService;
    private final ScannersRepository scannersRepository;

    public SessionService(UserService userService, ScannersRepository scannersRepository) {
        this.userService = userService;
        this.scannersRepository = scannersRepository;
    }

    // 세션 시작 시 시리얼 넘버 저장
    public void storeSerialNumberForUser(Long userId, Long serialNumber) {
        userSerialNumbers.put(userId, serialNumber);
    }

    // 트리거 발생 시 현재 시리얼 넘버 조회
    public Long getCurrentSerialNumberForUser(Long userId) {
        Long serialNumber = userSerialNumbers.get(userId);
        if (serialNumber == null) {
            throw new IllegalStateException("사용자가 현재 사용 중인 시리얼 넘버가 없습니다.");
        }
        return serialNumber;
    }

    // 세션 종료 시 시리얼 넘버 제거
    public void clearSerialNumberForUser(Long userId) {
        userSerialNumbers.remove(userId);
    }

    // 현재 로그인한 사용자 ID 조회 (Spring Security 사용 시)
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 인증 객체가 존재하는지, 그리고 인증된 상태인지 확인
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();

            // principal이 UserDetails 타입인 경우, 사용자의 ID를 가져옴
            if (principal instanceof UserDetails) {
                // UserDetails에서 이메일을 가져와서 사용자 정보를 조회
                String email = ((UserDetails) principal).getUsername();
                User user = userService.getUserWithAuthorities(email)
                        .orElseThrow(() -> new IllegalStateException("로그인된 사용자 정보를 찾을 수 없습니다."));

                return user.getId();  // 사용자 ID 반환
            }
        }

        // 인증되지 않은 경우 예외를 발생시킴
        throw new IllegalStateException("현재 로그인된 사용자를 찾을 수 없습니다.");
    }
}