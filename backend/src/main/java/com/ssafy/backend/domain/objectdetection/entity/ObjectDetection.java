package com.ssafy.backend.domain.objectdetection.entity;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "object_detection")
public class ObjectDetection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // 기본 키

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scanners_id", nullable = false)
    private Scanners scanners;  // 스캐너와 연관 관계

    @Column(name = "object_url")
    private String objectUrl;  // 객체가 저장된 URL

    @Column(name = "completed_at")
    private LocalDateTime completedAt;  // 작업 완료 시간

    @Column(name = "detection_type")
    private Integer detectionType;  // 탐지 유형 (0: 정상, 1: 불량)
}
