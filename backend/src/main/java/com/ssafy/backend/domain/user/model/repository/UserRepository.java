package com.ssafy.backend.domain.user.model.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ssafy.backend.domain.user.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // username을 사용하여 권한 정보와 함께 유저 정보를 가져오는 메소드
    @EntityGraph(attributePaths = "authorities")  // 권한 정보를 함께 가져오기 위해 EntityGraph 사용
    Optional<User> findOneWithAuthoritiesByEmail(String email);
}
