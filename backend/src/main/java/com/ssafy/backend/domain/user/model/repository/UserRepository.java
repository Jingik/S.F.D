package com.ssafy.backend.domain.user.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ssafy.backend.domain.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);  // 이메일 중복 체크 메서드
}
