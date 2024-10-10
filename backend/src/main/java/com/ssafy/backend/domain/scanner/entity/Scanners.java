package com.ssafy.backend.domain.scanner.entity;

import com.ssafy.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "scanners")
public class Scanners {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 자동 증가 ID 설정
    private Long id;  // 기본 키 (자동 증가)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // 사용자와의 관계

    @Column(name = "serial_number", nullable = false)
    private Long serialNumber;  // 시리얼 넘버

    @Column(name = "completed_at")
    private LocalDateTime completedAt;  // 작업 완료 시간

    @Column(name = "is_using", columnDefinition = "TINYINT(1)")
    private Boolean isUsing;  // 현재 사용 여부 (True: 사용 중, False: 사용 종료)
}
