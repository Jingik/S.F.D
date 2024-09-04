package com.ssafy.backend.domain.connection.model.repository;

import com.ssafy.backend.domain.connection.entity.ImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<ImageEntity, Long> {
}

