package com.ssafy.backend.domain.connection.model.service;

import com.ssafy.backend.domain.connection.entity.ImageEntity;
import com.ssafy.backend.domain.connection.model.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ImageService {

    private final ImageRepository imageRepository;

    @Autowired
    public ImageService(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    public ImageEntity saveImageMetadata(ImageEntity imageMetadata) {
        // 이미지 메타데이터 저장
        return imageRepository.save(imageMetadata);
    }
}
