package com.ssafy.backend.domain.defectanalysis.entity;

import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "defect_analysis")
public class DefectAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // 기본 키

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "object_detection_id", nullable = false)
    private ObjectDetection objectDetection;  // 객체 탐지와 연관 관계

    @Enumerated(EnumType.STRING)
    @Column(name = "analysis_details", nullable = false)
    private AnalysisDetails analysisDetails;  // 분석 세부 사항 (ENUM)

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;  // 분석 시간

    @Column(name = "confidence", nullable = false)
    private Double confidence;  // 신뢰도 (분석 결과의 정확도)
}
