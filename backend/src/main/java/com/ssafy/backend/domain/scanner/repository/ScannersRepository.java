package com.ssafy.backend.domain.scanner.repository;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface ScannersRepository extends JpaRepository<Scanners, Long> {

    // 특정 유저의 스캐너 기록을 조회하는 메서드
    List<Scanners> findByUserId(Long userId);

    // 시리얼 넘버로 스캐너를 조회하는 메서드
    Optional<Scanners> findBySerialNumber(Long serialNumber);
}
