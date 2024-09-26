package com.ssafy.backend.domain.admin.model.repository;

import com.ssafy.backend.domain.admin.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByEmail(String email); // 이메일로 관리자 찾기
}
