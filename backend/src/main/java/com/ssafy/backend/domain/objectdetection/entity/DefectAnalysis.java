package com.ssafy.backend.domain.defectanalysis.entity;

import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "defect_analysis")
public class DefectAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "object_detection_id", nullable = false)
    private ObjectDetection objectDetection;

    @Enumerated(EnumType.STRING)
    @Column(name = "analysis_details", nullable = false)
    private AnalysisDetails analysisDetails;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "confidence", nullable = false)
    private Double confidence;
}
