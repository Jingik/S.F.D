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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "serial_number", nullable = false)
    private Long serialNumber;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "is_using")
    private Boolean isUsing;  // true: 사용 중, false: 사용 종료
}
