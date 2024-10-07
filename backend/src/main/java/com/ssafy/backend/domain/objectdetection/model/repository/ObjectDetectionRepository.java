package com.ssafy.backend.domain.objectdetection.model.repository;

import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ObjectDetectionRepository extends JpaRepository<ObjectDetection, Long> {
    List<ObjectDetection> findByScanners_UserIdAndCompletedAtAfter(Long userId, LocalDateTime after);
    List<ObjectDetection> findByScanners_Id(Long scannerId);
}
