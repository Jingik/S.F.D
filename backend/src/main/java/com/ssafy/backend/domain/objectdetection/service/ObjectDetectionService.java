package com.ssafy.backend.domain.objectdetection.service;

import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import com.ssafy.backend.domain.objectdetection.repository.ObjectDetectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ObjectDetectionService {

    private final ObjectDetectionRepository objectDetectionRepository;

    public List<ObjectDetection> getObjectDetectionsByScannerId(Long scannersId) {
        return objectDetectionRepository.findByScannersId(scannersId);
    }

    public ObjectDetection saveObjectDetection(ObjectDetection objectDetection) {
        return objectDetectionRepository.save(objectDetection);
    }
}
