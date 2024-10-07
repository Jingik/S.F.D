package com.ssafy.backend.domain.record.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordDto {
    private String objectUrl;
    private LocalDateTime detectionDate;
    private Long scannerSerialNumber;
    private boolean isDefective;
    private String defectType;
    private double confidenceRate;  // 불량률(Confidence)
}