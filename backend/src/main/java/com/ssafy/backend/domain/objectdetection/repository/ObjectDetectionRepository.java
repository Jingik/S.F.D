package com.ssafy.backend.domain.objectdetection.repository;

import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObjectDetectionRepository extends JpaRepository<ObjectDetection, Long> {
    List<ObjectDetection> findByScannersId(Long scannersId);
}
