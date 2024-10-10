package com.ssafy.backend.domain.objectdetection.model.service;

import com.ssafy.backend.domain.objectdetection.dto.ObjectDetectionDto;
import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import com.ssafy.backend.domain.objectdetection.model.repository.ObjectDetectionRepository;
import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.model.service.ScannersService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ObjectDetectionService {
    private final ScannersService scannersService;
    private final ObjectDetectionRepository objectDetectionRepository;
    // 모든 ObjectDetection 조회
    public List<ObjectDetectionDto> getAllDetections() {
        List<ObjectDetection> detections = objectDetectionRepository.findAll();
        return detections.stream()
                .map(detection -> new ObjectDetectionDto(detection.getId(), detection.getObjectUrl(), detection.getDetectionType(), detection.getCompletedAt()))
                .collect(Collectors.toList());
    }

    // 특정 ObjectDetection 조회
    public ObjectDetectionDto getDetectionById(Long id) {
        ObjectDetection detection = objectDetectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No detection found with the given ID"));
        return new ObjectDetectionDto(detection.getId(), detection.getObjectUrl(), detection.getDetectionType(), detection.getCompletedAt());
    }

    // 트리거 발생 시 ObjectDetection을 업데이트하는 메서드
    public void updateObjectDetectionWithScanner(Long scannerId) {
        // ObjectDetection 테이블에서 마지막으로 저장된 데이터를 가져오기
        ObjectDetection lastDetection = objectDetectionRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new IllegalArgumentException("마지막 ObjectDetection 데이터를 찾을 수 없습니다."));

        // 스캐너 객체 가져오기
        Scanners scanner = scannersService.getScannerById(scannerId);

        // ObjectDetection에 스캐너 객체 설정
        lastDetection.setScanners(scanner);

        // ObjectDetection 저장 (업데이트)
        objectDetectionRepository.save(lastDetection);
    }


}