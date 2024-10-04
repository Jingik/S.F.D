package com.ssafy.backend.domain.scanner.controller;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.service.ScannersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/scanners")
public class VideoTriggerController {

    private final ScannersService scannersService;

    @PostMapping("/start/{serialNumber}")
    public ResponseEntity<?> startRecording(@PathVariable Long serialNumber) {
        // 시리얼 넘버로 스캐너 조회
        Scanners scanner = scannersService.findBySerialNumber(serialNumber);
        if (scanner == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 시리얼 넘버에 대한 스캐너 기록이 없습니다.");
        }

        // 스캐너 사용 상태 업데이트
        scanner.setIsUsing(true);
        scanner.setCompletedAt(null);
        scannersService.saveScanner(scanner);

        // 비디오 스트리밍 시작
        scannersService.startVideoStream(serialNumber);

        return ResponseEntity.ok("촬영을 시작했습니다.");
    }

    @PostMapping("/stop/{serialNumber}")
    public ResponseEntity<?> stopRecording(@PathVariable Long serialNumber) {
        // 시리얼 넘버로 스캐너 조회
        Scanners scanner = scannersService.findBySerialNumber(serialNumber);
        if (scanner == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 시리얼 넘버에 대한 스캐너 기록이 없습니다.");
        }

        // 스캐너 사용 종료
        scanner.setIsUsing(false);
        scanner.setCompletedAt(LocalDateTime.now());
        scannersService.saveScanner(scanner);

        // 비디오 스트리밍 종료
        scannersService.stopVideoStream(serialNumber);

        return ResponseEntity.ok("촬영을 종료했습니다.");
    }
}
