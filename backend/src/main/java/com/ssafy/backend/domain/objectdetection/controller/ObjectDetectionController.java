package com.ssafy.backend.domain.objectdetection.controller;

import com.ssafy.backend.domain.objectdetection.dto.ObjectDetectionDto;
import com.ssafy.backend.domain.objectdetection.model.service.ObjectDetectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/object-detections")
@RequiredArgsConstructor
@Tag(name = "객체 탐지 API", description = "객체 탐지 데이터와 관련된 API를 제공합니다.")
public class ObjectDetectionController {

    private final ObjectDetectionService objectDetectionService;

    @Operation(summary = "모든 객체 탐지 데이터 조회", description = "모든 객체 탐지 데이터를 조회하는 API입니다.")
    @GetMapping
    public ResponseEntity<List<ObjectDetectionDto>> getAllDetections() {
        List<ObjectDetectionDto> detections = objectDetectionService.getAllDetections();
        return ResponseEntity.ok(detections);
    }

    @Operation(summary = "ID로 특정 객체 탐지 데이터 조회", description = "ID를 기준으로 특정 객체 탐지 데이터를 조회하는 API입니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ObjectDetectionDto> getDetectionById(@PathVariable Long id) {
        ObjectDetectionDto detection = objectDetectionService.getDetectionById(id);
        return ResponseEntity.ok(detection);
    }
}

