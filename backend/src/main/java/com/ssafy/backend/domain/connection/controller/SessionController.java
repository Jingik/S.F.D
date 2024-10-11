package com.ssafy.backend.domain.connection.controller;

import com.ssafy.backend.domain.connection.model.service.SessionService;
import com.ssafy.backend.domain.objectdetection.model.service.ObjectDetectionService;
import com.ssafy.backend.domain.record.dto.RecordDto;
import com.ssafy.backend.domain.record.model.service.RecordService;
import com.ssafy.backend.domain.scanner.dto.ScannersDto;
import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.model.service.ScannersService;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.service.UserService;
import com.ssafy.backend.global.exception.NoRecordFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Tag(name = "SSE 연결 API", description = "SSE 연결 및 트리거 처리 관련 API를 제공합니다.")
@RestController
@RequestMapping("/session")
@RequiredArgsConstructor
public class SessionController {

    private final RecordService recordService; // 최신 데이터 조회를 위한 서비스
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>(); // 사용자 ID와 Emitter를 매핑하여 관리
    private final UserService userService;
    private final SessionService sessionService;
    private final ObjectDetectionService objectDetectionService;  // 의존성 주입
    private final ScannersService scannersService;

    @Operation(
            summary = "SSE 연결 설정",
            description = "클라이언트가 SSE 연결을 설정하는 엔드포인트입니다. 클라이언트가 이 API를 호출하면 SSE 연결이 설정되고, 서버가 실시간 이벤트를 전송할 수 있습니다."
    )
    @Transactional
    @GetMapping("/connect/{email}")
    public SseEmitter connect(@PathVariable String email) {
        // 이메일을 통해 사용자 정보 조회
        User user = userService.getUserWithAuthorities(email)
                .orElseThrow(() -> new NoRecordFoundException("사용자를 찾을 수 없습니다. 이메일: " + email));

        Long userId = user.getId();  // 조회한 User 객체에서 userId를 가져옴

        // 연결 설정 전에 모든 사용 중인 스캐너 완료 처리
        List<Scanners> activeScanners = scannersService.findAllActiveScanners();
        for (Scanners scanner : activeScanners) {
            scannersService.updateScannerUsage(scanner.getId(), false);
            System.out.println("사용 중인 스캐너 사용 완료 처리. 스캐너 ID: " + scanner.getId());
        }

        // 스캐너 생성 (serialNumber는 1로 고정)
        ScannersDto scannerDto = ScannersDto.builder()
                .userId(userId)  // 사용자 ID 설정
                .serialNumber(1L)  // 시리얼 넘버를 1로 고정
                .isUsing(true)  // 스캐너 사용 중으로 설정
                .build();

        ScannersDto createdScanner = scannersService.saveScanner(scannerDto);  // 스캐너 저장

        // 사용자 ID와 시리얼 넘버를 연결하여 저장 (SessionService 사용)
        sessionService.storeSerialNumberForUser(userId, 1L);  // serialNumber는 1로 고정

        // SSE 연결 설정
        SseEmitter emitter = new SseEmitter(3_600_000L); // 1시간 타임아웃
        emitters.put(userId, emitter); // 사용자 ID와 Emitter를 매핑

        // 연결이 종료되었을 때 해당 Emitter와 시리얼 넘버 제거
        emitter.onCompletion(() -> {
            emitters.remove(userId);
            sessionService.clearSerialNumberForUser(userId);  // 세션 종료 시 시리얼 넘버 제거
            System.out.println("SSE 연결이 종료되었습니다. 사용자 ID: " + userId);
        });

        // 타임아웃 발생 시 해당 Emitter 제거
        emitter.onTimeout(() -> {
            emitters.remove(userId);
            sessionService.clearSerialNumberForUser(userId);  // 타임아웃 시 시리얼 넘버 제거
            System.out.println("SSE 연결 타임아웃 발생. 사용자 ID: " + userId);
        });

        // 예외 발생 시 해당 Emitter 제거
        emitter.onError((ex) -> {
            emitters.remove(userId);
            sessionService.clearSerialNumberForUser(userId);  // 예외 발생 시 시리얼 넘버 제거
            System.out.println("SSE 연결 중 오류 발생: " + ex.getMessage() + " 사용자 ID: " + userId);
        });

        System.out.println("SSE 연결이 설정되었습니다. 사용자 ID: " + userId + ", 이메일: " + email);
        return emitter;
    }


    @Operation(
            summary = "SSE 연결 종료",
            description = "현재 연결된 모든 클라이언트의 SSE 연결을 종료하는 엔드포인트입니다."
    )
    @GetMapping("/disconnect")
    public ResponseEntity<String> disconnectAll() {
        emitters.forEach((userId, emitter) -> {
            try {
                if (emitter != null) {
                    emitter.complete();
                    System.out.println("SSE 연결을 종료했습니다. 사용자 ID: " + userId);
                }

                // 사용자 ID로 현재 사용 중인 가장 최근의 스캐너를 조회
                Scanners scanner = scannersService.findMostRecentActiveScanner();

                if (scanner != null && scanner.getIsUsing()) {
                    // 스캐너 사용 종료 처리
                    scannersService.updateScannerUsage(scanner.getId(), false);
                    System.out.println("스캐너 사용 종료 처리 완료. 사용자 ID: " + userId);
                }

                // 세션에서 시리얼 넘버 제거 (세션 로직에 따라 수정)
                sessionService.clearSerialNumberForUser(userId);

            } catch (Exception e) {
                emitter.completeWithError(e);
                System.out.println("SSE 연결 종료 중 오류 발생: " + e.getMessage());
            }
        });

        // 모든 Emitter를 제거
        emitters.clear();
        return ResponseEntity.ok("모든 SSE 연결이 종료되었습니다.");
    }

    @Operation(summary = "하드웨어 트리거 처리", description = "하드웨어에서 발생한 트리거를 처리하고, 클라이언트에게 최신 데이터를 전송하는 API입니다.")
    @GetMapping("/trigger")
    public ResponseEntity<String> handleTrigger() {

        // 현재 사용 중인 스캐너 중 가장 최근의 스캐너 조회
        Scanners scanner = scannersService.findMostRecentActiveScanner();

        // 트리거 발생 시 ObjectDetection 테이블의 마지막 데이터를 업데이트
        objectDetectionService.updateObjectDetectionWithScanner(scanner.getId());

        // 최신 데이터 전송 (SSE)
        sendDetectionEvent();

        return ResponseEntity.ok("하드웨어 트리거가 처리되었습니다.");
    }



    // 최신 데이터를 SSE로 클라이언트에게 전송하는 메서드
    public void sendDetectionEvent() {
        List<Long> deadEmitters = new ArrayList<>(); // 끊어진 Emitter를 추적하기 위한 리스트

        emitters.forEach((userId, emitter) -> {
            try {
                // 최신 Object Detection 데이터 가져오기
                RecordDto latestRecord = recordService.getLatestRecord(userId);
                emitter.send(SseEmitter.event()
                        .name("object-detected")
                        .data(latestRecord));  // 최신 데이터를 SSE로 전송
            } catch (IOException e) {
                deadEmitters.add(userId); // 문제가 발생한 Emitter는 제거 리스트에 추가
                System.out.println("데이터 전송 중 오류 발생. 사용자 ID: " + userId + " 오류: " + e.getMessage());
            }
        });

        // 끊어진 연결을 제거
        deadEmitters.forEach(emitters::remove);
    }
}
