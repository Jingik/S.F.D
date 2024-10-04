package com.ssafy.backend.domain.objectdetection.controller;

import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import com.ssafy.backend.domain.objectdetection.service.ObjectDetectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/object-detections")
@Tag(name = "객체 감지", description = "객체 감지와 관련된 API를 제공합니다.")
public class ObjectDetectionController {

    private final ObjectDetectionService objectDetectionService;

    @Operation(
            summary = "스캐너별 객체 감지 기록 조회",
            description = "해당 스캐너에서 감지된 객체 기록을 조회합니다."
    )
    @GetMapping("/scanner/{scannersId}")
    public List<ObjectDetection> getObjectDetectionsByScannerId(@PathVariable Long scannersId) {
        return objectDetectionService.getObjectDetectionsByScannerId(scannersId);
    }

    @Operation(
            summary = "객체 감지 기록 추가",
            description = "새로운 객체 감지 기록을 추가합니다."
    )
    @PostMapping("/add")
    public ObjectDetection addObjectDetection(@RequestBody ObjectDetection objectDetection) {
        return objectDetectionService.saveObjectDetection(objectDetection);
    }
}
