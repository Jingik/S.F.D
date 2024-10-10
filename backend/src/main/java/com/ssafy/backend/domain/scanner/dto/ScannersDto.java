package com.ssafy.backend.domain.scanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScannersDto {

    private Long id;  // 기본 키
    private Long userId;  // 사용자 ID
    private Long serialNumber;  // 시리얼 넘버
    private LocalDateTime completedAt;  // 작업 완료 시간
    private Boolean isUsing;  // 현재 사용 여부
}
