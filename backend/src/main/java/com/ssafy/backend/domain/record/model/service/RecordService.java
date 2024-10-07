package com.ssafy.backend.domain.record.model.service;

import com.ssafy.backend.domain.defectanalysis.entity.AnalysisDetails;
import com.ssafy.backend.domain.defectanalysis.entity.DefectAnalysis;
import com.ssafy.backend.domain.record.dto.RecordDto;
import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import com.ssafy.backend.domain.objectdetection.model.repository.ObjectDetectionRepository;
import com.ssafy.backend.domain.defectanalysis.model.repository.DefectAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final ObjectDetectionRepository objectDetectionRepository;
    private final DefectAnalysisRepository defectAnalysisRepository;

    // 최근 7일간 데이터 조회
    public List<RecordDto> getRecent7DaysRecords(Long userId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<ObjectDetection> detections = objectDetectionRepository.findByScanners_UserIdAndCompletedAtAfter(userId, sevenDaysAgo);

        return detections.stream().map(detection -> {
            DefectAnalysis defect = defectAnalysisRepository.findByObjectDetectionId(detection.getId()).stream().findFirst().orElse(null);
            return createRecordDto(detection, defect);
        }).collect(Collectors.toList());
    }

    // DTO 변환 메서드
    private RecordDto createRecordDto(ObjectDetection detection, DefectAnalysis defect) {
        String defectType;
        if (detection.getDetectionType() == 0) {
            defectType = "정상";
        } else if (defect != null) {
            defectType = mapEnumToType(defect.getAnalysisDetails());
        } else {
            defectType = "탐색 불가";
        }

        return RecordDto.builder()
                .objectUrl(detection.getObjectUrl())
                .detectionDate(detection.getCompletedAt())
                .scannerSerialNumber(detection.getScanners().getSerialNumber())
                .isDefective(detection.getDetectionType() == 1)
                .defectType(defectType)
                .confidenceRate(defect != null ? defect.getConfidence() : 100.0)
                .build();
    }

    // 분석 결과 enum을 문자열로 변환
    private String mapEnumToType(AnalysisDetails details) {
        switch (details) {
            case deformation: return "변형";
            case rusting: return "녹";
            case scratches: return "스크래치";
            case fracture: return "균열";
            default: return "UNKNOWN";
        }
    }

}