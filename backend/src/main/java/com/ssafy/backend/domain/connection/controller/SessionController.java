package com.ssafy.backend.domain.connection.controller;

import com.ssafy.backend.domain.record.dto.RecordDto;
import com.ssafy.backend.domain.record.model.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;

@RestController
@RequestMapping("/session")
@RequiredArgsConstructor
public class SessionController {

    private final SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // 긴 타임아웃 설정
    private final RecordService recordService; // 최신 데이터 조회를 위한 서비스

    // 클라이언트가 SSE 연결을 설정하는 엔드포인트
    @GetMapping("/connect")
    public SseEmitter connect() {
        System.out.println("SSE 연결이 설정되었습니다.");
        return emitter;
    }

    // 하드웨어 트리거가 발생할 때 호출될 API (GET 요청)
    @GetMapping("/trigger")
    public ResponseEntity<String> handleTrigger() {
        // 하드웨어에서 트리거가 발생했을 때 최신 데이터를 클라이언트로 전송
        sendDetectionEvent();
        return ResponseEntity.ok("하드웨어 트리거가 처리되었습니다.");
    }

    // 최신 데이터를 SSE로 클라이언트에게 전송하는 메서드
    public void sendDetectionEvent() {
        try {
            // 최신 데이터 가져오기
            RecordDto latestRecord = recordService.getLatestRecord();

            // SSE로 클라이언트에게 데이터 전송
            emitter.send(SseEmitter.event()
                    .name("object-detected")
                    .data(latestRecord));  // 최신 데이터 전송
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    }
}


