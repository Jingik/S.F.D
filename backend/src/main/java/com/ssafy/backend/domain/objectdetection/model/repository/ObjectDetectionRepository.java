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

    // 사용자 ID로 가장 최신의 데이터를 가져오는 메서드
    Optional<ObjectDetection> findTopByScanners_UserIdOrderByCompletedAtDesc(Long userId);

    // 새로운 메서드: 사용자 ID로 모든 ObjectDetection 데이터를 가져오는 메서드
    List<ObjectDetection> findByScanners_UserId(Long userId);

    // 마지막 탐지 객체 탐색
    Optional<ObjectDetection> findTopByOrderByIdDesc();

    // 사용자 ID와 오늘 날짜, 그리고 불량 객체 조건으로 데이터를 필터링하는 메서드
    List<ObjectDetection> findByScanners_UserIdAndCompletedAtAfterAndDetectionType(Long userId, LocalDateTime today, Integer detectionType);
}