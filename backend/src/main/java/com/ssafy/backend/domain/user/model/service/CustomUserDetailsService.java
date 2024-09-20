package com.ssafy.backend.domain.user.model.service;

import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component("userDetailsService")
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    @Transactional
    // 로그인 시 DB에서 유저 정보와 권한 정보를 가져와서 해당 정보를 기반으로 UserDetails 객체를 생성해 리턴
    public UserDetails loadUserByUsername(final String email) {
        return userRepository.findByEmail(email)
                .map(user -> createUser(user))  // 사용자 엔티티로 UserDetails 객체 생성
                .orElseThrow(() -> new UsernameNotFoundException(email + " -> 데이터베이스에서 찾을 수 없습니다."));
    }

    // UserDetails 인터페이스를 구현한 자체 User 엔티티 반환
    private User createUser(User user) {
        if (!user.isActivated()) {
            throw new RuntimeException(user.getEmail() + " -> 활성화되어 있지 않습니다.");
        }

        // User 엔티티 자체가 UserDetails를 구현하므로 그대로 반환
        return user;
    }
}

