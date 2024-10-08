package com.ssafy.backend.domain.connection.controller;

import com.ssafy.backend.domain.record.dto.RecordDto;
import com.ssafy.backend.domain.record.model.service.RecordService;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/session")
@RequiredArgsConstructor
public class SessionController {

    private final RecordService recordService; // 최신 데이터 조회를 위한 서비스
    private final List<SseEmitter> emitters = new ArrayList<>(); // 여러 클라이언트의 SSE 연결을 관리

    // 클라이언트가 SSE 연결을 설정하는 엔드포인트
    @GetMapping("/connect")
    public SseEmitter connect() {
        // SseEmitter 타임아웃을 10분(600,000ms)으로 설정
        SseEmitter emitter = new SseEmitter(600_000L); // 10분 타임아웃
        emitters.add(emitter); // 생성된 SseEmitter를 리스트에 추가하여 관리

        // 클라이언트가 연결을 끊었을 때 리스트에서 제거
        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            System.out.println("SSE 연결이 종료되었습니다.");
        });

        // 타임아웃이 발생했을 때 리스트에서 제거
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            System.out.println("SSE 연결 타임아웃이 발생했습니다.");
        });

        // 예외 발생 시 리스트에서 제거
        emitter.onError((ex) -> {
            emitters.remove(emitter);
            System.out.println("SSE 연결 중 오류가 발생했습니다: " + ex.getMessage());
        });

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
        RecordDto latestRecord = recordService.getLatestRecord();

        // 연결된 모든 클라이언트에게 데이터 전송
        List<SseEmitter> deadEmitters = new ArrayList<>();
        emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("object-detected")
                        .data(latestRecord));  // 최신 데이터 전송
            } catch (IOException e) {
                deadEmitters.add(emitter); // 에러가 발생하면 해당 Emitter는 제거
            }
        });

        // 끊어진 연결을 리스트에서 제거
        emitters.removeAll(deadEmitters);
    }
}
