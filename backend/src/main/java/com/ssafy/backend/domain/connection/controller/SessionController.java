package com.ssafy.backend.domain.connection.controller;

import com.ssafy.backend.domain.record.dto.RecordDto;
import com.ssafy.backend.domain.record.model.service.RecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Tag(name = "SSE 연결 API", description = "SSE 연결 및 트리거 처리 관련 API를 제공합니다.")
@RestController
@RequestMapping("/session")
@RequiredArgsConstructor
public class SessionController {

    private final RecordService recordService; // 최신 데이터 조회를 위한 서비스
    private final List<SseEmitter> emitters = new ArrayList<>(); // 여러 클라이언트의 SSE 연결을 관리

    @Operation(
            summary = "SSE 연결 설정",
            description = "클라이언트가 SSE 연결을 설정하는 엔드포인트입니다. 클라이언트가 이 API를 호출하면 SSE 연결이 설정되고, 서버가 실시간 이벤트를 전송할 수 있습니다."
    )
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

    @Operation(
            summary = "SSE 연결 종료",
            description = "현재 연결된 모든 클라이언트의 SSE 연결을 종료하는 엔드포인트입니다."
    )
    @GetMapping("/disconnect")
    public ResponseEntity<String> disconnectAll() {
        List<SseEmitter> deadEmitters = new ArrayList<>();

        // 모든 연결을 종료
        emitters.forEach(emitter -> {
            try {
                emitter.complete(); // 각 클라이언트와의 SSE 연결 종료
                System.out.println("SSE 연결을 종료했습니다.");
            } catch (Exception e) {
                emitter.completeWithError(e); // 오류 발생 시 연결 종료
                System.out.println("SSE 연결 종료 중 오류 발생: " + e.getMessage());
                deadEmitters.add(emitter); // 오류가 발생한 Emitter는 리스트에서 제거
            }
        });

        emitters.clear(); // 리스트에서 모든 Emitter를 제거
        return ResponseEntity.ok("모든 SSE 연결이 종료되었습니다.");
    }

    @Operation(
            summary = "하드웨어 트리거 처리",
            description = "하드웨어에서 발생한 트리거를 처리하고, 클라이언트에게 최신 데이터를 전송하는 API입니다."
    )
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
