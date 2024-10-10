package com.ssafy.backend.domain.objectdetection.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ObjectDetectionDto {
    private Long id;
    private String objectUrl;
    private Integer detectionType;
    private LocalDateTime completedAt;
}
