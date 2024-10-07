package com.ssafy.backend.domain.objectdetection.model.service;

import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import com.ssafy.backend.domain.objectdetection.model.repository.ObjectDetectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ObjectDetectionService {

    private final ObjectDetectionRepository objectDetectionRepository;

    // 특정 Scanner ID로 ObjectDetection 조회
    public List<ObjectDetection> getObjectDetectionsByScannerId(Long scannersId) {
        return objectDetectionRepository.findByScanners_Id(scannersId);
    }

    // ObjectDetection 저장
    public ObjectDetection saveObjectDetection(ObjectDetection objectDetection) {
        return objectDetectionRepository.save(objectDetection);
    }

    // 모든 ObjectDetection 조회
    public List<ObjectDetection> getAllDetections() {
        return objectDetectionRepository.findAll();
    }

    // 특정 ObjectDetection 조회
    public ObjectDetection getDetectionById(Long id) {
        return objectDetectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No detection found with the given ID"));
    }

    // ObjectDetection 삭제
    public void deleteObjectDetection(Long id) {
        objectDetectionRepository.deleteById(id);
    }
}
