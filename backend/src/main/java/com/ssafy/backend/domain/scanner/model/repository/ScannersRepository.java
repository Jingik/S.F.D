package com.ssafy.backend.domain.scanner.model.repository;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScannersRepository extends JpaRepository<Scanners, Long> {

    // 사용자 ID와 사용 여부로 스캐너 조회, 최신 기록만 반환
    Optional<Scanners> findTopByUserIdAndIsUsingOrderByIdDesc(Long userId, Boolean isUsing);

    // 사용 중인 모든 스캐너를 조회하는 메서드
    List<Scanners> findByIsUsing(Boolean isUsing);

}

