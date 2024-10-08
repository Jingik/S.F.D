package com.ssafy.backend.domain.record.controller;

import com.ssafy.backend.domain.record.dto.RecordDto;
import com.ssafy.backend.domain.record.model.service.RecordService;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;
    private final UserService userService;

    // 최근 7일간 데이터를 가져오는 기존 API
    @GetMapping("/recent")
    public ResponseEntity<List<RecordDto>> getRecentRecords() {
        User currentUser = userService.getMyUserWithAuthorities()
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        // User 객체에서 ID를 추출해서 전달
        List<RecordDto> records = recordService.getRecent7DaysRecords(currentUser.getId());
        return ResponseEntity.ok(records);
    }

    // 가장 최신 데이터를 가져오는 새로운 API
    @GetMapping("/latest")
    public ResponseEntity<RecordDto> getLatestRecord() {
        // 최신 데이터를 조회하여 반환
        RecordDto latestRecord = recordService.getLatestRecord();
        return ResponseEntity.ok(latestRecord);
    }
}