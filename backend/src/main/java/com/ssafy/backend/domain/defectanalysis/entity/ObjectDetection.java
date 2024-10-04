package com.ssafy.backend.domain.objectdetection.entity;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "object_detection")
public class ObjectDetection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scanners_id", nullable = false)
    private Scanners scanners;

    @Column(name = "object_url")
    private String objectUrl;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "detection_type")
    private Integer detectionType;  // 1: Normal, 0: Defective
}
