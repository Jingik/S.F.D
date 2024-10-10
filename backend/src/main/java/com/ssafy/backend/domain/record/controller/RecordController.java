package com.ssafy.backend.domain.record.controller;

import com.ssafy.backend.domain.record.dto.RecordDto;
import com.ssafy.backend.domain.record.model.service.RecordService;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.service.UserService;
import com.ssafy.backend.global.exception.NoRecordFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "기록 API", description = "유저의 기록 데이터를 관리하는 API를 제공합니다.")
@RestController
@RequestMapping("/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;
    private final UserService userService;

    @Operation(
            summary = "최근 7일간 기록 조회",
            description = "현재 로그인한 사용자의 최근 7일간의 기록을 조회하는 API입니다. 사용자의 ID를 기준으로 데이터를 조회하며, 사용자가 없다면 에러를 반환합니다."
    )
    @GetMapping("/recent")
    public ResponseEntity<List<RecordDto>> getRecentRecords() {
        User currentUser = userService.getMyUserWithAuthorities()
                .orElseThrow(() -> new NoRecordFoundException("사용자를 찾을 수 없습니다."));
        List<RecordDto> records = recordService.getRecent7DaysRecords(currentUser.getId());
        return ResponseEntity.ok(records);
    }

    @Operation(
            summary = "오늘 날짜의 불량 객체 조회",
            description = "현재 로그인한 사용자의 오늘 날짜에 해당하는 불량 객체를 조회하는 API입니다."
    )
    @GetMapping("/today/defective")
    public ResponseEntity<List<RecordDto>> getTodayDefectiveRecords() {
        User currentUser = userService.getMyUserWithAuthorities()
                .orElseThrow(() -> new NoRecordFoundException("사용자를 찾을 수 없습니다."));

        // 오늘 날짜의 불량 객체 조회
        List<RecordDto> defectiveRecords = recordService.getTodayDefectiveRecords(currentUser.getId());

        return ResponseEntity.ok(defectiveRecords);
    }

    @Operation(
            summary = "가장 최신 기록 조회",
            description = "현재 로그인한 사용자의 최신 기록을 조회하는 API입니다. 기록이 있을 경우 최신 데이터를 반환합니다."
    )
    @GetMapping("/latest")
    public ResponseEntity<RecordDto> getLatestRecord() {
        User currentUser = userService.getMyUserWithAuthorities()
                .orElseThrow(() -> new NoRecordFoundException("사용자를 찾을 수 없습니다."));

        // 사용자 ID를 기반으로 최신 기록을 조회
        RecordDto latestRecord = recordService.getLatestRecord(currentUser.getId());
        return ResponseEntity.ok(latestRecord);
    }

    @Operation(
            summary = "사용자별 스캐너 사용 기록 조회",
            description = "특정 사용자의 스캐너 기록을 조회하는 API입니다. 관리자 전용 API로, 사용자 ID를 기준으로 기록을 조회합니다."
    )
    @PreAuthorize("hasRole('ADMIN')")  // 관리자 권한이 있는 경우에만 접근 가능
    @GetMapping("/user/{userId}/scanners")
    public ResponseEntity<List<RecordDto>> getUserScannerRecords(@PathVariable Long userId) {
        // 사용자별 스캐너 기록 조회
        List<RecordDto> records = recordService.getUserScannerRecords(userId);
        return ResponseEntity.ok(records);
    }
}
