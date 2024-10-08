package com.ssafy.backend.domain.objectdetection.model.repository;

import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ObjectDetectionRepository extends JpaRepository<ObjectDetection, Long> {

    // 최근 7일간 데이터를 가져오는 기존 메서드
    List<ObjectDetection> findByScanners_UserIdAndCompletedAtAfter(Long userId, LocalDateTime after);

    // 스캐너 ID로 데이터를 가져오는 기존 메서드
    List<ObjectDetection> findByScanners_Id(Long scannerId);

    // 새로운 메서드: 사용자 ID로 가장 최신의 데이터를 하나 가져오기
    Optional<ObjectDetection> findTopByOrderByCompletedAtDesc();
}

