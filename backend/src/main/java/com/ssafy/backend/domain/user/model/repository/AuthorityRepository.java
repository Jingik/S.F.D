package com.ssafy.backend.domain.user.model.repository;

import com.ssafy.backend.domain.user.entity.Authority;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorityRepository extends JpaRepository<Authority, String> {
}
