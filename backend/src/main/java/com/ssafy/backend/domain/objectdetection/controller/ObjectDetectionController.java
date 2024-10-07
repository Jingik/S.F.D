package com.ssafy.backend.domain.objectdetection.controller;

import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import com.ssafy.backend.domain.objectdetection.model.service.ObjectDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/object-detections")
@RequiredArgsConstructor
public class ObjectDetectionController {

    private final ObjectDetectionService objectDetectionService;

    @GetMapping
    public ResponseEntity<List<ObjectDetection>> getAllDetections() {
        List<ObjectDetection> detections = objectDetectionService.getAllDetections();
        return ResponseEntity.ok(detections);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ObjectDetection> getDetectionById(@PathVariable Long id) {
        ObjectDetection detection = objectDetectionService.getDetectionById(id);
        return ResponseEntity.ok(detection);
    }

    @PostMapping
    public ResponseEntity<ObjectDetection> createDetection(@RequestBody ObjectDetection detection) {
        ObjectDetection createdDetection = objectDetectionService.saveObjectDetection(detection);
        return ResponseEntity.ok(createdDetection);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetection(@PathVariable Long id) {
        objectDetectionService.deleteObjectDetection(id);
        return ResponseEntity.ok().build();
    }
}
