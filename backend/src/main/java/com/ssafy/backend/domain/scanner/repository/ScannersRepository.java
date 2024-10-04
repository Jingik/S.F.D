package com.ssafy.backend.domain.scanner.repository;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScannersRepository extends JpaRepository<Scanners, Long> {
    List<Scanners> findByUserId(Long userId);
}
