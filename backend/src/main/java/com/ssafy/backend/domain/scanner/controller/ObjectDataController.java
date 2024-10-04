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
public class ObjectDataController {

    private final ScannersService scannersService;
    private final ObjectDetectionService objectDetectionService;
    private final DefectAnalysisService defectAnalysisService;

    @GetMapping("/objects/all/{serialNumber}")
    public ResponseEntity<?> getAllObjects(@PathVariable Long serialNumber) {
        Scanners scanner = scannersService.findBySerialNumber(serialNumber);
        if (scanner == null) {
            return ResponseEntity.status(404).body("해당 시리얼 넘버에 대한 스캐너 기록이 없습니다.");
        }

        List<ObjectDetection> detections = objectDetectionService.getObjectDetectionsByScannerId(scanner.getId());
        List<DefectAnalysis> analyses = detections.stream()
                .flatMap(detection -> defectAnalysisService.getDefectAnalysisByObjectDetectionId(detection.getId()).stream())
                .collect(Collectors.toList());

        return ResponseEntity.ok(analyses);
    }

    @GetMapping("/objects/defects/{serialNumber}")
    public ResponseEntity<?> getDefectiveObjectsOnly(@PathVariable Long serialNumber) {
        Scanners scanner = scannersService.findBySerialNumber(serialNumber);
        if (scanner == null) {
            return ResponseEntity.status(404).body("해당 시리얼 넘버에 대한 스캐너 기록이 없습니다.");
        }

        List<ObjectDetection> detections = objectDetectionService.getObjectDetectionsByScannerId(scanner.getId());
        List<DefectAnalysis> defectAnalyses = detections.stream()
                .flatMap(detection -> defectAnalysisService.getDefectAnalysisByObjectDetectionId(detection.getId())
                        .stream().filter(da -> da.getAnalysisDetails() != AnalysisDetails.NORMAL))
                .collect(Collectors.toList());

        return ResponseEntity.ok(defectAnalyses);
    }
}
