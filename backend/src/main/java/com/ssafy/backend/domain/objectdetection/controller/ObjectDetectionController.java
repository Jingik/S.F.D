package com.ssafy.backend.domain.objectdetection.controller;

import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import com.ssafy.backend.domain.objectdetection.service.ObjectDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/object-detections")
public class ObjectDetectionController {

    private final ObjectDetectionService objectDetectionService;

    @GetMapping("/scanner/{scannersId}")
    public List<ObjectDetection> getObjectDetectionsByScannerId(@PathVariable Long scannersId) {
        return objectDetectionService.getObjectDetectionsByScannerId(scannersId);
    }

    @PostMapping("/add")
    public ObjectDetection addObjectDetection(@RequestBody ObjectDetection objectDetection) {
        return objectDetectionService.saveObjectDetection(objectDetection);
    }
}
