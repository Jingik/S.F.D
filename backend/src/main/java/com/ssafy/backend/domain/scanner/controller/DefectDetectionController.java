package com.ssafy.backend.domain.scanner.controller;

import com.ssafy.backend.domain.defectanalysis.entity.AnalysisDetails;
import com.ssafy.backend.domain.defectanalysis.entity.DefectAnalysis;
import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import com.ssafy.backend.domain.objectdetection.service.ObjectDetectionService;
import com.ssafy.backend.domain.defectanalysis.service.DefectAnalysisService;
import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.service.ScannersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/scanners")
public class DefectDetectionController {

    private final ScannersService scannersService;
    private final ObjectDetectionService objectDetectionService;
    private final DefectAnalysisService defectAnalysisService;

    @PostMapping("/defect/{serialNumber}")
    public ResponseEntity<?> detectDefectiveObjects(@PathVariable Long serialNumber) {
        // 시리얼 넘버로 스캐너 조회
        Scanners scanner = scannersService.findBySerialNumber(serialNumber);
        if (scanner == null) {
            return ResponseEntity.status(404).body("해당 시리얼 넘버에 대한 스캐너 기록이 없습니다.");
        }

        // 객체 탐지 및 결함 분석 정보 조회
        List<ObjectDetection> detections = objectDetectionService.getObjectDetectionsByScannerId(scanner.getId());
        List<DefectAnalysis> defectAnalyses = detections.stream()
                .flatMap(detection -> defectAnalysisService.getDefectAnalysisByObjectDetectionId(detection.getId())
                        .stream().filter(da -> da.getAnalysisDetails() != AnalysisDetails.NORMAL)) // 불량 데이터만 필터링
                .collect(Collectors.toList());

        return ResponseEntity.ok(defectAnalyses);
    }
}
