package com.ssafy.backend.domain.defectanalysis.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DefectAnalysisDto {
    private Long id;
    private String analysisDetails;
    private Double confidence;
    private LocalDateTime timestamp;
}